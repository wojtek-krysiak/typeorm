import "reflect-metadata";
import {Category} from "./entity/Category";
import {Connection} from "../../../../src";
import {closeTestingConnections, createTestingConnections, reloadTestingDatabases} from "../../../utils/test-utils";

describe("tree tables > closure-table", () => {

    let connections: Connection[];
    beforeAll(async () => connections = await createTestingConnections({
        entities: [Category]
    }));
    beforeEach(() => reloadTestingDatabases(connections));
    afterAll(() => closeTestingConnections(connections));

    test("categories should be attached via parent and saved properly", () => Promise.all(connections.map(async connection => {
        const categoryRepository = connection.getTreeRepository(Category);

        const a1 = new Category();
        a1.name = "a1";
        await categoryRepository.save(a1);

        const a11 = new Category();
        a11.name = "a11";
        a11.parentCategory = a1;
        await categoryRepository.save(a11);

        const a12 = new Category();
        a12.name = "a12";
        a12.parentCategory = a1;
        await categoryRepository.save(a12);

        const rootCategories = await categoryRepository.findRoots();
        expect(rootCategories).toEqual([{
            id: 1,
            name: "a1"
        }]);

        const a11Parent = await categoryRepository.findAncestors(a11);
        expect(a11Parent).toHaveLength(2);
        expect(a11Parent).toContainEqual({ id: 1, name: "a1" });
        expect(a11Parent).toContainEqual({ id: 2, name: "a11" });

        const a1Children = await categoryRepository.findDescendants(a1);
        expect(a1Children).toHaveLength(3);
        expect(a1Children).toContainEqual({ id: 1, name: "a1" });
        expect(a1Children).toContainEqual({ id: 2, name: "a11" });
        expect(a1Children).toContainEqual({ id: 3, name: "a12" });
    })));

    test("categories should be attached via children and saved properly", () => Promise.all(connections.map(async connection => {
        const categoryRepository = connection.getTreeRepository(Category);

        const a1 = new Category();
        a1.name = "a1";
        await categoryRepository.save(a1);

        const a11 = new Category();
        a11.name = "a11";

        const a12 = new Category();
        a12.name = "a12";

        a1.childCategories = [a11, a12];
        await categoryRepository.save(a1);

        const rootCategories = await categoryRepository.findRoots();
        expect(rootCategories).toEqual([{
            id: 1,
            name: "a1"
        }]);

        const a11Parent = await categoryRepository.findAncestors(a11);
        expect(a11Parent).toHaveLength(2);
        expect(a11Parent).toContainEqual({ id: 1, name: "a1" });
        expect(a11Parent).toContainEqual({ id: 2, name: "a11" });

        const a1Children = await categoryRepository.findDescendants(a1);
        expect(a1Children).toHaveLength(3);
        expect(a1Children).toContainEqual({ id: 1, name: "a1" });
        expect(a1Children).toContainEqual({ id: 2, name: "a11" });
        expect(a1Children).toContainEqual({ id: 3, name: "a12" });
    })));

    test("categories should be attached via children and saved properly and everything must be saved in cascades", () => Promise.all(connections.map(async connection => {
        const categoryRepository = connection.getTreeRepository(Category);

        const a1 = new Category();
        a1.name = "a1";

        const a11 = new Category();
        a11.name = "a11";

        const a12 = new Category();
        a12.name = "a12";

        const a111 = new Category();
        a111.name = "a111";

        const a112 = new Category();
        a112.name = "a112";

        a1.childCategories = [a11, a12];
        a11.childCategories = [a111, a112];
        await categoryRepository.save(a1);

        const rootCategories = await categoryRepository.findRoots();
        expect(rootCategories).toEqual([{
            id: 1,
            name: "a1"
        }]);

        const a11Parent = await categoryRepository.findAncestors(a11);
        expect(a11Parent).toHaveLength(2);
        expect(a11Parent).toContainEqual({ id: 1, name: "a1" });
        expect(a11Parent).toContainEqual({ id: 2, name: "a11" });

        const a1Children = await categoryRepository.findDescendants(a1);
        const a1ChildrenNames = a1Children.map(child => child.name);
        expect(a1ChildrenNames).toHaveLength(5);
        expect(a1ChildrenNames).toContainEqual("a1");
        expect(a1ChildrenNames).toContainEqual("a11");
        expect(a1ChildrenNames).toContainEqual("a12");
        expect(a1ChildrenNames).toContainEqual("a111");
        expect(a1ChildrenNames).toContainEqual("a112");
    })));

    // todo: finish implementation and implement on other trees
    test.skip("categories should remove removed children", () => Promise.all(connections.map(async connection => {
        const categoryRepository = connection.getTreeRepository(Category);

        const a1 = new Category();
        a1.name = "a1";
        const a11 = new Category();
        a11.name = "a11";
        const a12 = new Category();
        a12.name = "a12";
        a1.childCategories = [a11, a12];
        await categoryRepository.save(a1);

        const a1Children1 = await categoryRepository.findDescendants(a1);
        const a1ChildrenNames1 = a1Children1.map(child => child.name);
        expect(a1ChildrenNames1).toHaveLength(3);
        expect(a1ChildrenNames1).toContainEqual("a1");
        expect(a1ChildrenNames1).toContainEqual("a11");
        expect(a1ChildrenNames1).toContainEqual("a12");

        // a1.childCategories = [a11];
        // await categoryRepository.save(a1);
        //
        // const a1Children2 = await categoryRepository.findDescendants(a1);
        // const a1ChildrenNames2 = a1Children2.map(child => child.name);
        // expect(a1ChildrenNames2).toHaveLength(3);
        // expect(a1ChildrenNames2).toContainEqual("a1");
        // expect(a1ChildrenNames2).toContainEqual("a11");
        // expect(a1ChildrenNames2).toContainEqual("a12");
    })));

    // todo: finish implementation and implement on other trees
    test.skip("sub-category should be removed with all its children", () => Promise.all(connections.map(async connection => {
        const categoryRepository = connection.getTreeRepository(Category);

        const a1 = new Category();
        a1.name = "a1";
        const a11 = new Category();
        a11.name = "a11";
        const a12 = new Category();
        a12.name = "a12";
        a1.childCategories = [a11, a12];
        await categoryRepository.save(a1);

        const a1Children1 = await categoryRepository.findDescendants(a1);
        const a1ChildrenNames1 = a1Children1.map(child => child.name);
        expect(a1ChildrenNames1).toHaveLength(3);
        expect(a1ChildrenNames1).toContainEqual("a1");
        expect(a1ChildrenNames1).toContainEqual("a11");
        expect(a1ChildrenNames1).toContainEqual("a12");

        await categoryRepository.remove(a1);

        // a1.childCategories = [a11];
        // await categoryRepository.save(a1);
        //
        // const a1Children2 = await categoryRepository.findDescendants(a1);
        // const a1ChildrenNames2 = a1Children2.map(child => child.name);
        // expect(a1ChildrenNames2).toHaveLength(3);
        // expect(a1ChildrenNames2).toContainEqual("a1");
        // expect(a1ChildrenNames2).toContainEqual("a11");
        // expect(a1ChildrenNames2).toContainEqual("a12");
    })));

});
