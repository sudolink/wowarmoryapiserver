Simple server that queries a Mysql database (vMangos WoW structure), and serves the data to the WoWArmory frontend.

Make an .env file in project root and make sure to define the following variables:
DB_IP = dbip (localhost if running on same machine as the database)
DB_PORT = dbport (not in use atm)
DB_USER = dbuser
DB_PW = password

I suggest making a new mysql user for the database, with only read permissions - you don't want sql injections, and I do barely and input-checking.

Server accesses the 'characters' and 'mangos' databases and some of their tables.

Needs access to these:
characters database
 |--- characters          (need player's guid for equipment checking, class, and visuals),
 |--- character_inventory (checking only slots 0-18, i.e. what is equipped)
 |--- item_instance       (checking item instance for enchantments)

mangos database:
 |--- item_template       (get base item info)