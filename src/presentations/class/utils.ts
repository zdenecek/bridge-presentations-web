import {
  ConfiguratorOptions,
  normalizeConfiguratorOptions,
} from "./ConfiguratorOptions";

export function downloadObjectAsJson(
  exportObj: unknown,
  exportName: string,
): void {
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

export interface FileEventTarget {
  files?: FileList;
}

export function loadJson(
  input: FileEventTarget,
): Promise<ConfiguratorOptions | undefined> {
  return new Promise((resolve, reject) => {
    if (typeof window.FileReader !== "function")
      reject("The file API isn't supported on this browser.");
    else if (!input)
      reject("The browser does not properly implement the event object");
    else if (!input.files)
      reject(
        "This browser does not support the `files` property of the file input.",
      );
    else if (!input.files[0]) resolve(undefined);
    else {
      const file = input.files[0];
      const fr = new FileReader();
      fr.onload = (a) => {
        if (a.target?.result) {
          const res = JSON.parse(a.target.result as string);

          resolve(normalizeConfiguratorOptions(res));
        } else reject("failed");
      };
      fr.readAsText(file);
    }
  });
}
