import skillLineData from "./data/SkillLine_RESTRUCTURED.json" assert {type: "json"};
import skillLineAbilityDataRESTRUCTURED from "./data/SkillLineAbility_RESTRUCTURED.json" assert {type: "json"};
import talentsTreesWithTalents from "./data/TalentTreesWithTalents.json" assert {type: "json"};
import ClassTalentTrees from "./data/ClassTalentTrees.json" assert {type: "json"};

function resolvePlayerClass(classInt){
    let classTable = ["NOCLASS","Warrior","Paladin","Hunter","Rogue","Priest","Death Knight","Shaman","Mage","Warlock","UNK2","Druid"]
    return classTable[classInt];
}


function getSkillLine(skillLineID){
    return skillLineData[skillLineID];
}

function getAbilitySkillLineDetails(spellUINT){
    //ID: 13219, SkillLine: 256, Spell: 25289, RaceMask: 0, ClassMask: 1, ExcludeRace: 0, ExcludeClass: 0, MinSkillLineRank: 1, SupercededBySpell: 0,
    //AquireMethod: 0, TrivialSkillLineRankHigh: 0, TrivialSkillLineRankLow: 0, CharacterPoints_1: 0, CharacterPoints_2: 0, NumSkillUps: 0
    let ability= skillLineAbilityDataRESTRUCTURED[`${spellUINT}`];
    let skillLine= getSkillLine(ability['SkillLine']);
    return {ability: ability, skillLine: skillLine};
}

function getTalentTreesForClass(classUINT){
    const classStr = resolvePlayerClass(classUINT);
    const talentTrees = ClassTalentTrees[classStr];
    console.log(talentTrees)
    return talentTrees;
}

function isTalent(spellUINT){
    let ability= skillLineAbilityDataRESTRUCTURED[`${spellUINT}`];
    let skillLine= getSkillLine(ability['SkillLine']);
    console.log(ability)
    //if talent, return talent tree, else false

    return skillLine['CategoryID'] == 7 // 7 is for talents
}

function getSkill(skillUINT){
    console.log(skillLineAbilityDataRESTRUCTURED[0]);
}

export {
    getSkill,
    getAbilitySkillLineDetails,
    getTalentTreesForClass,
    isTalent
}