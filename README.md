Simple server that queries a Mysql database (vMangos WoW structure), and serves the data to the WoWArmory frontend.


SETUP:
Make an .env file in project root and make sure to define the following variables:
DB_IP = dbip (localhost if running on same machine as the database)
DB_PORT = dbport (not in use atm)
DB_USER = dbuser
DB_PW = password
PORT = this server port (if you want to specify a port otherwise it'll run on 5000)

npm run start

I suggest making a new mysql user for the database, with only read permissions - you don't want sql injections, and I do barely and input-checking.

Server accesses the 'characters' and 'mangos' databases and some of their tables.

Needs access to these:
characters database:
characters          (need player's guid for equipment checking, class, and visuals),
character_inventory (checking only slots 0-18, i.e. what is equipped)
item_instance       (checking item instance for enchantments)
*outdated list*

mangos database:
item_template       (get base item info)
*outdated list*

You will also need to make a separate database and name it something like 'armorydbc' that will contain the talent, ability, and talent tab information ported from the client. The api server needs this info to send talent-tree info about requested characters to the front-end app.
the files needed to be sourced into that new database are in the 'ArmorySQL' folder of this project. You can run them directly or source them from the mysql cli. Be sure to use/select the armory database before running them.
Each file will generate a new table named 'db_name-of-file_patchInt'
e.g. -> 'db_SkillLine_5875'