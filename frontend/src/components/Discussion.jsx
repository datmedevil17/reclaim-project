import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const Discussion = ({ discussionContract,account }) => {
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState('');


  useEffect(() => {
    const loadTweets = async () => {
      if (state.contract) {
        const tweetsCount = await state.contract.tweetCount(); // Assuming you have a tweetCount method
        const tweetsArray = [];
        for (let i = 0; i < tweetsCount; i++) {
          const tweet = await state.contract.tweets(i); // Assuming you have a tweets method
          tweetsArray.push(tweet);
        }
        setTweets(tweetsArray);
      }
    };

    loadTweets();
  }, [state.contract]);

  const handleTweetChange = (e) => {
    setNewTweet(e.target.value);
  };

  const handleTweetSubmit = async (e) => {
    e.preventDefault();
    if (state.contract && newTweet) {
      await state.contract.addTweet(newTweet); // Assuming you have an addTweet method
      setNewTweet(''); // Clear the input after submitting
      // Reload tweets after adding a new one
      const tweetsCount = await state.contract.tweetCount();
      const updatedTweets = [];
      for (let i = 0; i < tweetsCount; i++) {
        const tweet = await state.contract.tweets(i);
        updatedTweets.push(tweet);
      }
      setTweets(updatedTweets);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Discussion Board</h2>
      <div className="space-y-4">
        {tweets.map((tweet, index) => (
          <div
            key={index}
            className={`p-3 rounded-md shadow-md ${
              tweet.author === account ? 'bg-blue-200 text-right' : 'bg-white text-left'
            }`}
          >
            <p className="font-medium">{tweet.text}</p>
            <span className="text-sm text-gray-500">{tweet.author}</span>
          </div>
        ))}
      </div>
      {isVerified && ( // Show tweet input only if verified
        <form onSubmit={handleTweetSubmit} className="mt-4">
          <textarea
            value={newTweet}
            onChange={handleTweetChange}
            placeholder="Write your tweet..."
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
          >
            Tweet
          </button>
        </form>
      )}
    </div>
  );
};

export default Discussion;
