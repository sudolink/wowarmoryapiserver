import skillLineData from "./data/SkillLine_RESTRUCTURED.json" assert {type: "json"};
import skillLineAbilityDataRESTRUCTURED from "./data/SkillLineAbility_RESTRUCTURED.json" assert {type: "json"};
import ClassTalentTrees from "./data/ClassTalentTreesModTWO.json" assert {type: "json"};
import SpellIcons from "./data/SpellToIcon.json" assert {type: "json"};

const cat7SkillLines = {
    '6': 'Frost', '8': 'Fire', '26': 'Arms', '38': 'Combat', '39': 'Subtlety', '40': 'Poisons', '50': 'Beast Mastery', '51': 'Survival', '56': 'Holy',
    '78': 'Shadow Magic', '134': 'Feral Combat', '163': 'Marksmanship', '184': 'Retribution', '188': 'Pet - Imp', '189': 'Pet - Felhunter', '203': 'Pet - Spider',
    '204': 'Pet - Voidwalker', '205': 'Pet - Succubus', '206': 'Pet - Infernal', '207': 'Pet - Doomguard', '208': 'Pet - Wolf', '209': 'Pet - Cat', '210': 'Pet - Bear',
    '211': 'Pet - Boar', '212': 'Pet - Crocilisk', '213': 'Pet - Carrion Bird', '214': 'Pet - Crab', '215': 'Pet - Gorilla', '217': 'Pet - Raptor', '218': 'Pet - Tallstrider',
    '236': 'Pet - Scorpid', '237': 'Arcane', '251': 'Pet - Turtle', '253': 'Assassination', '256': 'Fury', '257': 'Protection', '261': 'Beast Training', '267': 'Protection',
    '270': 'Pet - Generic', '354': 'Demonology', '355': 'Affliction', '373': 'Enhancement', '374': 'Restoration', '375': 'Elemental', '573': 'Restoration', '574': 'Balance',
    '593': 'Destruction', '594': 'Holy', '613': 'Discipline', '633': 'Lockpicking', '653': 'Pet - Bat', '654': 'Pet - Hyena', '655': 'Pet - Owl', '656': 'Pet - Wind Serpent'
}
const talentnames = {
    "Warrior": ["Arms", "Fury", "Protection"], "Paladin": ["Holy", "Protection", "Retribution"], "Hunter": ["Beast Mastery", "Marksmanship", "Survival"],
    "Rogue": ["Assassination", "Combat", "Subtlety"], "Priest": ["Discipline", "Holy", "Shadow"], "Shaman": ["Elemental", "Enhancement", "Restoration"], "Mage": ["Arcane", "Fire", "Frost"],
    "Warlock": ["Affliction", "Demonology", "Destruction"], "Druid": ["Balance", "Feral Combat", "Restoration"]
}
const skillLineIDs = {
    "Warrior": ["26", "256", "257"], "Paladin": ["594", "267", "188"], "Hunter": ["50", "163", "51"],
    "Rogue": ["253", "38", "39"], "Priest": ["613", "56", "78"], "Shaman": ["375", "373", "374"], "Mage": ["237", "8", "6"],
    "Warlock": ["355", "354", "593"], "Druid": ["574", "134", "573"]
}
const TalentTabID = {
    "Warrior": ["161", "164", "163"], "Paladin": ["382", "383", "381"], "Hunter": ["361", "363", "362"],
    "Rogue": ["182", "181", "183"], "Priest": ["201", "202", "203"], "Shaman": ["261", "263", "262"], "Mage": ["81", "41", "61"],
    "Warlock": ["301", "303", "301"], "Druid": ["283", "281", "282"]
}


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