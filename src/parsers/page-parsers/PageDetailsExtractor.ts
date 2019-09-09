import {Node} from "acorn";
import * as walk from "acorn-walk";
import {extend} from "acorn-jsx-walk";
import {Component, PageDetails} from "../../api-models/PageDetails";
import recursiveWalkerFunctions from "../core/RecursiveWalkerFunctions";

extend(walk.base);

export async function extractPageDetails(ast: Node) {
    const pageDetails: PageDetails = new PageDetails();
    await walk.recursive(ast, {prevState: null, details: pageDetails}, recursiveWalkerFunctions);
    console.dir(pageDetails);
    return pageDetails;
}
