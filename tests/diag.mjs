console.log("Node version:", process.version);
console.log("Has crypto:", typeof crypto !== "undefined");
console.log("Has subtle:", crypto && typeof crypto.subtle !== "undefined");
console.log("Has getRandomValues:", crypto && typeof crypto.getRandomValues !== "undefined");
