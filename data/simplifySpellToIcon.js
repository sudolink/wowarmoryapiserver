import fs from "fs";
import Spell from "./Spell.json" assert {type: "json"};
import SpellIcon from "./SpellIcon.json" assert {type: "json"};

let newDict = {}

Object.keys(Spell).forEach(spell => {
    let spellID = Spell[spell].ID;
    let iconID = Spell[spell].SpellIconID;
    Object.keys(SpellIcon).forEach(index => {
        if (SpellIcon[index].ID == iconID) {
            let iconPath = SpellIcon[index]['TextureFilename'];
            let fileName = iconPath.split("\\").pop(); //split path by '\', grab last entry in resulting array
            newDict[spellID] = fileName;
        }
    })
})
fs.writeFileSync("SpellToIcon.json", JSON.stringify(newDict));