const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Blog", async function () {
  let Blog, blog;

  beforeEach(async () => {
    Blog = await ethers.getContractFactory("Blog");
    blog = await Blog.deploy("Test Blog");
    await blog.deployed();
  });

  it("should create a post", async () => {
    await blog.createPost("My Test Post", "12345");

    const posts = await blog.fetchPosts();
    expect(posts.length).to.equal(1);
    expect(posts[0].id).to.equal(1);
    expect(posts[0].title).to.equal("My Test Post");
    expect(posts[0].contentHash).to.equal("12345");
    expect(posts[0].version).to.equal(1);
    // expect(posts[0].versions[0].contentHash).to.equal("12345");
    // TODO: test updated by is deployer
  });

  it("should suggest an edit", async () => {
    await blog.createPost("My Test Post", "12345");

    const posts = await blog.fetchPosts();
    expect(posts.length).to.equal(1);

    await blog.suggestEdit(1, "23456");

    expect(posts[0].id).to.equal(1);
    expect(posts[0].title).to.equal("My Test Post");
    expect(posts[0].contentHash).to.equal("12345");
    expect(posts[0].version).to.equal(1);

    const suggestions = await blog.fetchSuggestQueue();
    expect(suggestions.length).to.equal(1);

    expect(suggestions[0].id).to.equal(1);
    expect(suggestions[0].contentHash).to.equal("23456");
    expect(suggestions[0].ogPost.version).to.equal(1);
    expect(suggestions[0].ogPost.contentHash).to.equal("12345");
    expect(suggestions[0].ogPost.title).to.equal("My Test Post");
  });

  it("should accept an edit", async () => {
    await blog.createPost("My Test Post", "12345");

    const posts = await blog.fetchPosts();
    expect(posts.length).to.equal(1);

    await blog.suggestEdit(1, "23456");

    const suggestions = await blog.fetchSuggestQueue();
    expect(suggestions.length).to.equal(1);

    await blog.acceptSuggestion(1);

    const posts2 = await blog.fetchPosts();
    expect(posts2.length).to.equal(1);
    expect(posts2[0].id).to.equal(1);
    expect(posts2[0].title).to.equal("My Test Post");
    expect(posts2[0].contentHash).to.equal("23456");
    expect(posts2[0].version).to.equal(2);
  });

  it("should fetch posts", async () => {
    await blog.createPost("My Test Post", "12345");

    const posts = await blog.fetchPosts();
    expect(posts.length).to.equal(1);

    await blog.createPost("My Second Test Post", "23456");

    const posts2 = await blog.fetchPosts();
    expect(posts2.length).to.equal(2);
    expect(posts2[1].id).to.equal(2);
    expect(posts2[1].title).to.equal("My Second Test Post");
    expect(posts2[1].contentHash).to.equal("23456");
    expect(posts2[1].version).to.equal(1);
  });

  it("should fetch suggest queue", async () => {
    await blog.createPost("My Test Post", "12345");

    await blog.suggestEdit(1, "23456");

    const suggestions = await blog.fetchSuggestQueue();
    expect(suggestions.length).to.equal(1);

    await blog.suggestEdit(1, "34567");

    const suggestions2 = await blog.fetchSuggestQueue();
    expect(suggestions2.length).to.equal(2);
    expect(suggestions2[1].id).to.equal(2);
    expect(suggestions2[1].contentHash).to.equal("34567");
    expect(suggestions2[1].ogPost.id).to.equal(1);
    expect(suggestions2[1].ogPost.title).to.equal("My Test Post");
    expect(suggestions2[1].ogPost.version).to.equal(1);
    expect(suggestions2[1].ogPost.contentHash).to.equal("12345");
  });
});
