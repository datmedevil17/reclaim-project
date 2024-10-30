// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Discussion {
    struct Message {
        address author;
        string content;
        uint timestamp;
    }

    Message[] public messages;

    event MessagePosted(address indexed author, string content, uint timestamp);

    // Function to post a message
    function postMessage(string calldata content) external {
        require(bytes(content).length > 0, "Message content cannot be empty");

        Message memory newMessage = Message({
            author: msg.sender,
            content: content,
            timestamp: block.timestamp
        });

        messages.push(newMessage);
        emit MessagePosted(msg.sender, content, block.timestamp);
    }

    // Function to get all messages
    function getMessages() external view returns (Message[] memory) {
        return messages;
    }
}
