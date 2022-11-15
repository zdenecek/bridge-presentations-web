export function downloadObjectAsJson(exportObj: any, exportName: string): void {
    const json = [JSON.stringify(exportObj)];
    const blob1 = new Blob(json, { type: "text/plain;charset=utf-8" });

    const url = window.URL || window.webkitURL;
    const link = url.createObjectURL(blob1);
    const a = document.createElement("a");
    a.download = exportName;
    a.href = link;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export function loadJson(event: any): Promise<any> {
    return new Promise((resolve, reject) => {
        if (typeof window.FileReader !== "function") reject("The file API isn't supported on this browser.");
        const input = event.target;
        if (!input) reject("The browser does not properly implement the event object");
        if (!input.files) reject("This browser does not support the `files` property of the file input.");

        if (!input.files[0]) resolve(undefined);
        const file = input.files[0];
        const fr = new FileReader();
        fr.onload = a => { if(a.target?.result)  resolve(JSON.parse(a.target.result as string));
                            else reject("failed");};
        fr.readAsText(file);
    });
}
