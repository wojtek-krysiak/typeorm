import "reflect-metadata";
import {createTestingConnections, closeTestingConnections, reloadTestingDatabases} from "../../utils/test-utils";
import {Connection} from "../../../src";
import {User} from "./entity/User";

// TODO: wrong test
describe("github issues > #2147 Lazy load JoinColumn with multiple columns name property is ignored for second reference column", () => {

    let connections: Connection[];
    beforeAll(async () => connections = await createTestingConnections({
         entities: [__dirname + "/entity/*{.js,.ts}"],
         schemaCreate: true,
         dropSchema: true,
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    afterAll(() => closeTestingConnections(connections));

    test("should create multiple column join for lazy loading relationship", () => {
        return Promise.all(connections.map(async connection => {
            // tests go here
            const username = "user name";
            const user = new User();
            user.key = 10;
            user.clientId = 16;
            user.name = username;
            user.updatedById = 10;
            await connection.manager.save(user);

            const users = await connection.manager.find(User);

            const updatedBy = await users[0].updatedBy;

            return expect(updatedBy.name).toEqual(username);

        }));
    });
});
