import fs from "fs";

import talentTrees from "./ClassTalentTrees.json" assert {type: "json"};

const talentTreesModified = {};

Object.keys(talentTrees).forEach(classStr => {
    let classTrees = talentTrees[classStr];
    classTrees = classTrees.map(tree => {
        let tempTree = { ...tree }
        let tempTalents = {}
        Object.keys(tree.TalentTab.talents).map(item => {
            tempTalents[item] = { bought: false, ...tree.TalentTab.talents[item] }
        })
        tempTree.TalentTab.talents = tempTalents;
        return tempTree;
    })
    talentTreesModified[classStr] = classTrees;
})

fs.writeFileSync("ClassTalentTreesModTWO.json", JSON.stringify(talentTreesModified))
