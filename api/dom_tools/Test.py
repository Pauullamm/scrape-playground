from api.dom_tools.Tools import scrape
from bs4 import BeautifulSoup
import json
from api.server_tools.utils import ScraperTool
import requests
from typing import List, Dict, Union

class TreeNode:
    def __init__(self, content: str):
        self.content = content
        self.children: List['TreeNode'] = []

    def add_child(self, child: 'TreeNode'):
        self.children.append(child)

    def __repr__(self):
        return f"TreeNode(content='{self.content}', children={self.children})"
    
class HTMLParser:
    '''
    A class which parses html content from a url to identify potential json-like content
    It recursively looks for curly braces in html text and formats it into a tree-like json object with nodes and children
    
    example use:
    url = 'https://bibleread.online/life-study-of-the-bible/life-study-of-matthew/1/#cont1'
    parser = HTMLParser(url=url)
    json_content = parser.extract_json()
    
    with open('parsed_html.json', 'w', encoding='utf-8') as f:
        json.dump(json_content, f, ensure_ascii=False, indent=4)

    '''
    def __init__(self, url: str):
        self.url = url
        self.response = requests.get(url)
    
    def _parse_brackets(self, s: str) -> TreeNode:
        """
        Parses a string and constructs a tree of nested brackets.
        
        :param s: The input string containing nested brackets.
        :return: The root TreeNode of the constructed tree.
        """
        stack = []
        root = TreeNode("root")
        stack.append(root)
        i = 0
        n = len(self.url)
        
        while i < n:
            if s[i] == '{':
                # Start of a new nested bracket
                new_node = TreeNode("")
                stack[-1].add_child(new_node)
                stack.append(new_node)
                i += 1
            elif s[i] == '}':
                # End of the current nested bracket
                stack.pop()
                i += 1
            else:
                # Collect content between brackets
                start = i
                while i < n and s[i] not in {'{', '}'}:
                    i += 1
                content = s[start:i].strip()
                if content:
                    stack[-1].content += content
            # Skip any whitespace or other characters
            while i < n and s[i].isspace():
                i += 1
        
        return root

    def _tree_to_json(self, node: TreeNode) -> Union[str, Dict]:
        """
        Converts a TreeNode tree into a JSON-compatible dictionary.
        
        :param node: The root TreeNode of the tree.
        :return: A JSON-compatible dictionary representing the tree.
        """
        if not node.children:
            # If the node has no children, return its content as a string
            return node.content
        
        # If the node has children, create a dictionary to represent it
        result = {}
        if node.content:
            result["content"] = node.content
        
        # Recursively convert children to JSON
        if node.children:
            result["children"] = [self._tree_to_json(child) for child in node.children]
        
        return result


    def extract_json(self):
        soup = BeautifulSoup(self.response.text, 'html.parser')
        
        # Find all script tags
        scripts = soup.find_all('script')
        extracted_data = []
        
        # Loop through script tags
        for script in scripts:
            script_content = script.string
            if script_content:
                start = script_content.find("{")
                end = script_content.rfind("}")
                json_content = script.string[start:end]
                json_content = json_content.replace("\r", "").replace("\n", "").replace("\t", "").strip()
                tree = self._parse_brackets(json_content)
                final_data = self._tree_to_json(tree)
                extracted_data.append(final_data)
                
                with open('test.json', 'w', encoding='utf-8') as f:
                    json.dump(extracted_data, f, ensure_ascii=False, indent=4)
                    
                
        return extracted_data
