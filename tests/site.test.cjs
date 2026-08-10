const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const html=fs.readFileSync("index.html","utf8"),js=fs.readFileSync("js/app.js","utf8");
test("three playable game cards are present",()=>{assert.equal((html.match(/class="game-card/g)||[]).length,3);for(const slug of ["PechaKucha","Bowling-Allee","Wissensturm"])assert.match(html,new RegExp(`github\\.io/${slug}/`))});
test("portal includes German controls and VK link",()=>{assert.match(html,/DeutschSchatzkiste auf VK/);assert.match(html,/Helles Design einschalten/);assert.match(js,/startMusic/)});
