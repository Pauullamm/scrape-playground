import asyncio
import warnings
import copy
import time
from typing import Any, Dict, Optional, Union, List

# BaseNode: Represents the building block of the workflow
class BaseNode:
    def __init__(self):
        self.params: Dict[str, Any] = {}
        self.successors: Dict[str, 'BaseNode'] = {}

    def set_params(self, params: Dict[str, Any]) -> None:
        self.params = params

    def add_successor(self, node: 'BaseNode', action: str = "default") -> 'BaseNode':
        if action in self.successors:
            warnings.warn(f"Overwriting successor for action '{action}'")
        self.successors[action] = node
        return node

    # Prepare shared resources (input transformation, initial setup)
    def prep(self, shared: Dict[str, Any]) -> Any:
        pass

    # Core computation of the node (e.g., LLM call)
    def exec(self, prep_res: Any) -> Any:
        pass

    # Postprocessing after execution (e.g., storing results, deciding next action)
    def post(self, shared: Dict[str, Any], prep_res: Any, exec_res: Any) -> Optional[str]:
        pass

    # Wrapper to execute core logic with prep and post steps
    def _run(self, shared: Dict[str, Any]) -> Optional[str]:
        prep_res = self.prep(shared)
        exec_res = self.exec(prep_res)
        return self.post(shared, prep_res, exec_res)

    def run(self, shared: Dict[str, Any]) -> Optional[str]:
        if self.successors:
            warnings.warn("Node won't run successors. Use Flow.")
        return self._run(shared)

    def __rshift__(self, other: 'BaseNode') -> 'BaseNode':
        return self.add_successor(other)

    def __sub__(self, action: str) -> '_ConditionalTransition':
        if isinstance(action, str):
            return _ConditionalTransition(self, action)
        raise TypeError("Action must be a string")

# Conditional transition between nodes
class _ConditionalTransition:
    def __init__(self, src: BaseNode, action: str):
        self.src = src
        self.action = action

    def __rshift__(self, tgt: BaseNode) -> BaseNode:
        return self.src.add_successor(tgt, self.action)

# A Node with retries and fallback for fault tolerance
class Node(BaseNode):
    def __init__(self, max_retries: int = 1, wait: float = 0):
        super().__init__()
        self.max_retries = max_retries
        self.wait = wait

    def exec_fallback(self, prep_res: Any, exc: Exception) -> Any:
        raise exc

    def _exec(self, prep_res: Any) -> Any:
        for i in range(self.max_retries):
            try:
                return self.exec(prep_res)
            except Exception as e:
                if i == self.max_retries - 1:
                    return self.exec_fallback(prep_res, e)
                if self.wait > 0:
                    time.sleep(self.wait)

# A Node that processes a batch of items
class BatchNode(Node):
    def _exec(self, items: List[Any]) -> List[Any]:
        return [super(BatchNode, self)._exec(item) for item in items]

# A Flow orchestrates a sequence or graph of Nodes
class Flow(BaseNode):
    def __init__(self, start: BaseNode):
        super().__init__()
        self.start = start

    def get_next_node(self, curr: BaseNode, action: Optional[str]) -> Optional[BaseNode]:
        nxt = curr.successors.get(action or "default")
        if not nxt and curr.successors:
            warnings.warn(f"Flow ends: '{action}' not found in {list(curr.successors.keys())}")
        return nxt

    def _orch(self, shared: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> None:
        curr = copy.copy(self.start)
        curr_params = params or {**self.params}

        while curr:
            curr.set_params(curr_params)
            action = curr._run(shared)
            curr = copy.copy(self.get_next_node(curr, action))

    def _run(self, shared: Dict[str, Any]) -> Optional[str]:
        prep_res = self.prep(shared)
        self._orch(shared)
        return self.post(shared, prep_res, None)

    def exec(self, prep_res: Any) -> None:
        raise RuntimeError("Flow can't exec.")

# A Flow for processing batches of items
class BatchFlow(Flow):
    def _run(self, shared: Dict[str, Any]) -> Optional[str]:
        prep_res = self.prep(shared) or []
        for batch_params in prep_res:
            self._orch(shared, {**self.params, **batch_params})
        return self.post(shared, prep_res, None)

# A Node with asynchronous capabilities
class AsyncNode(Node):
    async def prep_async(self, shared: Dict[str, Any]) -> Any:
        pass

    async def exec_async(self, prep_res: Any) -> Any:
        pass

    async def exec_fallback_async(self, prep_res: Any, exc: Exception) -> Any:
        raise exc

    async def post_async(self, shared: Dict[str, Any], prep_res: Any, exec_res: Any) -> Optional[str]:
        pass

    async def _exec(self, prep_res: Any) -> Any:
        for i in range(self.max_retries):
            try:
                return await self.exec_async(prep_res)
            except Exception as e:
                if i == self.max_retries - 1:
                    return await self.exec_fallback_async(prep_res, e)
                if self.wait > 0:
                    await asyncio.sleep(self.wait)

    async def run_async(self, shared: Dict[str, Any]) -> Optional[str]:
        if self.successors:
            warnings.warn("Node won't run successors. Use AsyncFlow.")
        return await self._run_async(shared)

    async def _run_async(self, shared: Dict[str, Any]) -> Optional[str]:
        prep_res = await self.prep_async(shared)
        exec_res = await self._exec(prep_res)
        return await self.post_async(shared, prep_res, exec_res)

# Extending AsyncNode for batch processing
class AsyncBatchNode(AsyncNode, BatchNode):
    async def _exec(self, items: List[Any]) -> List[Any]:
        return [await super(AsyncBatchNode, self)._exec(item) for item in items]

class AsyncParallelBatchNode(AsyncNode, BatchNode):
    async def _exec(self, items: List[Any]) -> List[Any]:
        return await asyncio.gather(*(super(AsyncParallelBatchNode, self)._exec(item) for item in items))

# Async flow orchestration
class AsyncFlow(Flow, AsyncNode):
    async def _orch_async(self, shared: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> None:
        curr = copy.copy(self.start)
        curr_params = params or {**self.params}

        while curr:
            curr.set_params(curr_params)
            action = await (curr._run_async(shared) if isinstance(curr, AsyncNode) else curr._run(shared))
            curr = copy.copy(self.get_next_node(curr, action))

    async def _run_async(self, shared: Dict[str, Any]) -> Optional[str]:
        prep_res = await self.prep_async(shared)
        await self._orch_async(shared)
        return await self.post_async(shared, prep_res, None)

class AsyncBatchFlow(AsyncFlow, BatchFlow):
    async def _run_async(self, shared: Dict[str, Any]) -> Optional[str]:
        prep_res = await self.prep_async(shared) or []
        for batch_params in prep_res:
            await self._orch_async(shared, {**self.params, **batch_params})
        return await self.post_async(shared, prep_res, None)

class AsyncParallelBatchFlow(AsyncFlow, BatchFlow):
    async def _run_async(self, shared: Dict[str, Any]) -> Optional[str]:
        prep_res = await self.prep_async(shared) or []
        await asyncio.gather(*(self._orch_async(shared, {**self.params, **batch_params}) for batch_params in prep_res))
        return await self.post_async(shared, prep_res, None)
