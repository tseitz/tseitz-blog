//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Blog {
  string public name;
  address public owner;

  using Counters for Counters.Counter;
  Counters.Counter private _postIds;
  Counters.Counter private _suggestions;

  mapping(uint256 => Post) private idToPost;
  mapping(string => Post) private hashToPost;
  mapping(uint256 => PostSuggestion) private suggestQueue;

  struct Post {
    uint256 id; // counter
    string title;
    string contentHash; // ipfs hash
    // Version[] versions; // allows editable
    uint256 version;
    address updatedBy;
  }

  // struct Version {
  //   uint256 versionId;
  //   string contentHash; // I'm not sure how to isolate counters yet. i.e. mapping(uint256 => Counters.counter)
  // }

  struct PostSuggestion {
    uint256 id;
    string contentHash; // ipfs hash
    address suggestedBy;
    Post ogPost;
  }

  event PostCreated(uint256 id, string title, string hash);
  event PostSuggested(uint256 id, string hash, address suggestedBy);
  event PostAccepted(uint256 id, string hash, address updatedBy);

  constructor(string memory _name) {
    console.log('Deploying Blog name', _name);
    name = _name;
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  function createPost(string memory title, string memory hash) public onlyOwner {
    _postIds.increment();
    uint256 postId = _postIds.current();

    Post storage post = idToPost[postId];
    post.id = postId;
    post.title = title;
    post.contentHash = hash;
    post.updatedBy = msg.sender;
    // TODO: figure out how to do this
    // Version memory version;
    // version.contentHash = hash;
    // version.versionId = 1;
    // post.versions.push(version);
    post.version = 1;
    hashToPost[hash] = post;

    emit PostCreated(post.id, post.title, hash);
  }

  function suggestEdit(uint256 postId, string memory hash) public {
    _suggestions.increment();
    uint suggestId = _suggestions.current();

    PostSuggestion memory suggested;
    suggested.id = suggestId;
    suggested.contentHash = hash;
    suggested.suggestedBy = msg.sender;
    suggested.ogPost = idToPost[postId];
    suggestQueue[suggestId] = suggested;

    emit PostSuggested(postId, hash, msg.sender);
  }

  function acceptSuggestion(uint256 suggestId) public onlyOwner {
    PostSuggestion storage suggested = suggestQueue[suggestId];
    Post storage post = suggested.ogPost;
    
    post.contentHash = suggested.contentHash;
    post.updatedBy = suggested.suggestedBy;
    post.version++;
    // Version memory version;
    // version.contentHash = hash;
    // version.versionId = post.versions[post.versions.length - 1].versionId + 1; // I'm sure there's something wrong with this
    idToPost[post.id] = post;
    hashToPost[post.contentHash] = post;

    emit PostAccepted(post.id, post.contentHash, post.updatedBy);
  }

  function fetchPost(string memory hash) public view returns (Post memory) {
    return hashToPost[hash];
  }

  function fetchPosts() public view returns (Post[] memory) {
    uint256 itemCount = _postIds.current();

    Post[] memory posts = new Post[](itemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      uint256 currentId = i + 1;
      Post storage post = idToPost[currentId];
      posts[i] = post;
    }
    return posts;
  }

  function fetchSuggestQueue() public view returns (PostSuggestion[] memory) {
    uint256 itemCount = _suggestions.current();

    PostSuggestion[] memory suggestions = new PostSuggestion[](itemCount);
    for (uint256 i = 0; i < itemCount; i++) {
      uint256 currentId = i + 1;
      PostSuggestion storage suggestion = suggestQueue[currentId];
      suggestions[i] = suggestion;
    }
    return suggestions;
  }
}

