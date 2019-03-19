import "reflect-metadata";
import {Post} from "./entity/Post";
import {Connection} from "../../../src";
import {createTestingConnections} from "../../utils/test-utils";

describe("sqljs driver > autosave", () => {
    let connections: Connection[];
    let saves = 0;
    const callback = (database: Uint8Array) => {
        saves++;
    };

    beforeAll(async () => connections = await createTestingConnections({
        entities: [Post],
        schemaCreate: true,
        enabledDrivers: ["sqljs"],
        driverSpecific: {
            autoSaveCallback: callback,
            autoSave: true
        }
    }));

    test("should call autoSaveCallback on insert, update and delete", () => Promise.all(connections.map(async connection => {
        let posts = [
            {
                title: "second post"
            },
            {
                title: "third post"
            }
        ];

        await connection.createQueryBuilder().insert().into(Post).values(posts).execute();
        await connection.createQueryBuilder().update(Post).set({title: "Many posts"}).execute();
        await connection.createQueryBuilder().delete().from(Post).where("title = ?", {title: "third post"}).execute();

        const repository = connection.getRepository(Post);
        let post = new Post();
        post.title = "A post";
        await repository.save(post);

        let savedPost = await repository.findOne({title: "A post"});

        expect(savedPost).not.toBeDefined();

        if (savedPost) {
            savedPost.title = "A updated post";
            await repository.save(savedPost);
            await repository.remove(savedPost);
        }

        await connection.close();

        expect(saves).toEqual(7);
    })));
});

describe("sqljs driver > autosave off", () => {
    let connections: Connection[];
    let saves = 0;
    const callback = (database: Uint8Array) => {
        saves++;
    };

    beforeAll(async () => connections = await createTestingConnections({
        entities: [Post],
        schemaCreate: true,
        enabledDrivers: ["sqljs"],
        driverSpecific: {
            autoSaveCallback: callback,
            autoSave: false
        }
    }));

    test("should not call autoSaveCallback when autoSave is disabled", () => Promise.all(connections.map(async connection => {
        const repository = connection.getRepository(Post);
        let post = new Post();
        post.title = "A post";
        await repository.save(post);

        let savedPost = await repository.findOne({title: "A post"});

        expect(savedPost).not.toBeDefined();

        if (savedPost) {
            savedPost.title = "A updated post";
            await repository.save(savedPost);
            await repository.remove(savedPost);
        }

        await connection.close();

        expect(saves).toEqual(0);
    })));
});
