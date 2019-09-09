export class Page {
    slug: string;
    title: string;
    key: string;
    path: string;
    pathAs: string;
    pathParam: string;

    constructor(page) {
        this.slug = page.slug;
        this.title = page.title;
        this.key = page.key;
        this.path = page.path;
        this.pathAs = page.pathAs;
        this.pathParam = page.pathParam;
    }
}
