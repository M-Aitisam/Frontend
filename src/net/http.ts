// Dump HTTP related stuff here

export async function post(url: string, content: any): Promise<Response> {
    return await fetch("https://yuxr9sytdf.execute-api.ap-southeast-2.amazonaws.com/dev/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
}