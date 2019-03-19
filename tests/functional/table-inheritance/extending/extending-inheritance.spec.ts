import "reflect-metadata";
import {Connection} from "../../../../src";
import {Post} from "./entity/Post";
import {
    closeTestingConnections,
    createTestingConnections,
    reloadTestingDatabases
} from "../../../utils/test-utils";

describe("table inheritance > regular inheritance using extends keyword", () => {

    let connections: Connection[];
    beforeAll(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    afterAll(() => closeTestingConnections(connections));

    test("should work correctly", () => Promise.all(connections.map(async connection => {

        const post = new Post();
        post.name = "Super title";
        post.text = "About this post";
        await connection.manager.save(post);

        const loadedPost = await connection
            .manager
            .createQueryBuilder(Post, "post")
            .where("post.id = :id", { id: 1 })
            .getOne();

        expect(loadedPost).not.toBeUndefined();
        expect(loadedPost!.name).not.toBeUndefined();
        expect(loadedPost!.text).not.toBeUndefined();
        expect(loadedPost!.name).toEqual("Super title");
        expect(loadedPost!.text).toEqual("About this post");

    })));

});
