import skillLineData from "./data/SkillLine_RESTRUCTURED.json" assert {type: "json"};
import skillLineAbilityDataRESTRUCTURED from "./data/SkillLineAbility_RESTRUCTURED.json" assert {type: "json"};
import ClassTalentTrees from "./data/ClassTalentTreesModTWO.json" assert {type: "json"};
import SpellIcons from "./data/SpellToIcon.json" assert {type: "json"};

function resolvePlayerClass(classInt) {
    let classTable = ["NOCLASS", "Warrior", "Paladin", "Hunter", "Rogue", "Priest", "Death Knight", "Shaman", "Mage", "Warlock", "UNK2", "Druid"]
    return classTable[classInt];
}

function getSkill(skillUINT) {
    console.log(skillLineAbilityDataRESTRUCTURED);
}

function getSkillLine(skillLineID) {
    return skillLineData[skillLineID];
}

function getSpellIcon(spellID) {
    return SpellIcons[spellID];
}

function getAbilitySkillLineDetails(spellUINT) {
    //ID: 13219, SkillLine: 256, Spell: 25289, RaceMask: 0, ClassMask: 1, ExcludeRace: 0, ExcludeClass: 0, MinSkillLineRank: 1, SupercededBySpell: 0,
    //AquireMethod: 0, TrivialSkillLineRankHigh: 0, TrivialSkillLineRankLow: 0, CharacterPoints_1: 0, CharacterPoints_2: 0, NumSkillUps: 0
    let ability = skillLineAbilityDataRESTRUCTURED[`${spellUINT}`];
    let skillLine = getSkillLine(ability['SkillLine']);
    return { ability: ability, skillLine: skillLine };
}

function getTalentTreesForClass(classUINT) {
    const classStr = resolvePlayerClass(classUINT);
    const talentTrees = ClassTalentTrees[classStr];
    // console.log(talentTrees)
    return talentTrees;
}

function getSkillLineForSpell(spellID) {
    return skillLineAbilityDataRESTRUCTURED[spellID]
}

function getSkillLineNumberForSpell(spellID) {
    return getSkillLineForSpell(spellID).SkillLine;
}

function getPopulatedTalentTrees(classUINT, talents) {  ///THIS IS BRUTE FORCING REFACTOR ALL OF THIS.
    let talentTrees = getTalentTreesForClass(classUINT);
    let populatedTalentTrees;
    Object.keys(talents).map(spellID => {
        let spell = talents[spellID]
        spell.icon = getSpellIcon(spellID);
        let tempTalentTrees = talentTrees.map(talentTree => { //map over the 3 talent trees
            return getPopulatedTalentTree(talentTree, spell);
        })
        populatedTalentTrees = tempTalentTrees;
    })
    return populatedTalentTrees;
}

function getPopulatedTalentTree(talentTree, spell) {
    if (getSkillLineNumberForSpell(spell.entry) == talentTree.skillLineID) {
        Object.keys(talentTree.TalentTab.talents).map(talentID => {
            let currentTalent = talentTree.TalentTab.talents[talentID];
            for (let i = 1; i <= 9; i++) {
                if (currentTalent[`SpellRank_${i}`] == spell.entry) {
                    // console.log(`spell '${spell.name}' (${spell.entry}) is rank "${i}"`)
                    // talentTree.pointsSpent += i;
                    talentTree.pointsSpent = talentTree.pointsSpent + i;
                    currentTalent.spell_bought = { [spell.entry]: { ...spell } };
                }
            }
        })
    }
    console.log(talentTree.pointsSpent, "\t -->", talentTree.name)
    return talentTree;
}

function isTalent(spellUINT) {
    let ability = skillLineAbilityDataRESTRUCTURED[`${spellUINT}`] || null;
    let skillLine = ability != null ? getSkillLine(ability['SkillLine']) : null;
    return skillLine?.CategoryID == 7// 7 is for talents
}

export {
    getSkill,
    getAbilitySkillLineDetails,
    getTalentTreesForClass,
    getPopulatedTalentTrees,
    isTalent
}