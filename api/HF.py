from smolagents import CodeAgent, LiteLLMModel, tool
from huggingface_hub import list_models

model = LiteLLMModel(
    model_id='ollama_chat/llama3.2',
)

@tool
def model_download_tool(task: str) -> str:
    """
    This is a tool that returns the most downloaded model of a given task on the Hugging Face Hub.
    It returns the name of the checkpoint.

    Args:
        task: The task for which to get the download count.
    """
    most_downloaded_model = next(iter(list_models(filter=task, sort="downloads", direction=-1)))
    return most_downloaded_model.id