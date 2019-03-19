import "reflect-metadata";
import { Connection } from "../../../src";
import { closeTestingConnections, createTestingConnections, reloadTestingDatabases } from "../../utils/test-utils";
import { Item, EmbeddedItem } from "./entity/Item";

describe("github issue > #1569 updateById generates wrong SQL with arrays inside embeddeds", () => {

    let connections: Connection[] = [];
    beforeAll(async () => connections = await createTestingConnections({
        entities: [__dirname + "/entity/*{.js,.ts}"],
        enabledDrivers: ["postgres"],
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    afterAll(() => closeTestingConnections(connections));

    test("should properly updateById arrays inside embeddeds", () => Promise.all(connections.map(async connection => {
        const item = new Item();
        item.someText = "some";
        const embedded = new EmbeddedItem();
        embedded.arrayInsideEmbedded = [1, 2, 3];
        item.embedded = embedded;

        await connection.getRepository(Item).save(item);

        await connection.getRepository(Item).update(item.id, {
            someText: "some2",
            embedded: {
                arrayInsideEmbedded: [1, 2],
            },
        });

        const loadedItem = await connection.getRepository(Item).findOne(item.id);

        expect(loadedItem!.embedded.arrayInsideEmbedded).toEqual([1, 2]);

    })));

});
