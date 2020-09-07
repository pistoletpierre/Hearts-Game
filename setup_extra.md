# Complete(ish) setup instructions

## Clone the repo
```bash
git clone 'https://github.com/pistoletpierre/Hearts-Game'
cd Hearts-Game
```

## Update package manager & install postgresql (ubuntu/debian/raspbian)
```bash
sudo apt update -y
sudo apt install -y npm
sudo apt install -y postgresql postgresql-contrib
```
f
### Optional: pgadmin4: nice to have for SQL table inspection/query debugging
#### RPI way (modify PGADMIN_DEFAULT_EMAIL & PGADMIN_DEFAULT_PASSWORD below as desired)
```bash
# Instructions from  https://medium.com/@mglaving/how-to-install-pgadmin4-on-raspberry-pi-4-raspbian-10-buster-howto-guide-495dab15199d or https://web.archive.org/web/20200906211318/https://medium.com/@mglaving/how-to-install-pgadmin4-on-raspberry-pi-4-raspbian-10-buster-howto-guide-495dab15199d
sudo apt update
sudo apt upgrade
sudo apt install build-essential libssl-dev libffi-dev libgmp3-dev virtualenv python-pip libpq-dev python-dev python3 nano
virtualenv -p python3 ~/pgadmin4
cd ~/pgadmin4
mkdir var
mkdir var/storage
mkdir var/sessions
source bin/activate
wget 'https://ftp.postgresql.org/pub/pgadmin/pgadmin4/v4.25/pip/pgadmin4-4.25-py3-none-any.whl'
pip3 install pgadmin4-4.25-py3-none-any.whl
pip3 install 'werkzeug<1.0'
echo 'import os
PGADMIN_DEFAULT_EMAIL="a@a.a"
PGADMIN_DEFAULT_PASSWORD="123456"
LOG_FILE = os.path.expanduser("~/pgadmin4/var/log")
SQLITE_PATH = os.path.expanduser("~/pgadmin4/var/pgadmin4.db")
SESSION_DB_PATH = os.path.expanduser("~/pgadmin4/var/sessions")
STORAGE_DIR = os.path.expanduser("~/pgadmin4/var/storage")' > ~/pgadmin4/lib/python3.7/site-packages/pgadmin4/config_local.py
# To launch pgAdmin4.py, run the following and then go to localhost:5050 in a browser & authenticate with the credentials above
python3 ~/pgadmin4/lib/python3.7/site-packages/pgadmin4/pgAdmin4.py
```

### Normal way (debian/ubuntu):
#### Install the public key for the repository (if not done previously):
```bash
curl https://www.pgadmin.org/static/packages_pgadmin_org.pub | sudo apt-key add
```
#### Create the repository configuration file:
```bash
sudo sh -c 'echo "deb https://ftp.postgresql.org/pub/pgadmin/pgadmin4/apt/$(lsb_release -cs) pgadmin4 main" > /etc/apt/sources.list.d/pgadmin4.list && apt update'
```
#### Install pgAdmin
```bash
sudo apt install -y pgadmin4
```





## Several steps will use these variables, so follow the rest in order
```bash
export DATABASE_NAME=HEARTS_GAME_DB

# I'm picking the most recent one here. I've always installed it on a fresh machine, so this was trivial. If you have multiple versions installed, adjust the line setting POSTGRESQL_DIR
cd /var/lib/postgresql/
export POSTGRESQL_DIR=$(\ls -dt * | head -n 1)
cd -
```
## Make an .env file for...some npm package that reads it - I don't remember the details
```bash
echo DATABASE_URL=postgres://`whoami`@localhost:5432/${DATABASE_NAME} > .env
```

## This was necessary on an Ubuntu machine but not on Raspberry Pi
```
[ -f /var/lib/postgresql/${POSTGRESQL_DIR}/main/postgresql.conf ] ||
sudo -u postgres cp  /var/lib/postgresql/${POSTGRESQL_DIR}/main/postgresql.auto.conf /var/lib/postgresql/${POSTGRESQL_DIR}/main/postgresql.conf
```

## Add to /etc/postgresql/${POSTGRESQL_DIR}/main/pg_hba.conf after "local all all peer" line
### For hearts game db DATABASE_NAME (replace ${...} with the database name and your username on the machine)
- host    ${DATABASE_NAME}   $(whoami)             ::1/128                 trust
- host    ${DATABASE_NAME}   $(whoami)             127.0.0.1/32            trust

### this command will do it
```bash
sudo sed -i -E 's/(local\s+all\s+all\s+peer)/\1\n\n'"host    ${DATABASE_NAME}   $(whoami)             ::1\/128                 trust\nhost    ${DATABASE_NAME}   $(whoami)             127.0.0.1\/32            trust"'/g' /etc/postgresql/${POSTGRESQL_DIR}/main/pg_hba.conf
```

## Restart PostgreSQL
```bash
sudo -u postgres /usr/lib/postgresql/${POSTGRESQL_DIR}/bin/pg_ctl -D /var/lib/postgresql/${POSTGRESQL_DIR}/main restart
```

## Create the hearts game database
```bash
sudo -u postgres createdb ${DATABASE_NAME}
```

## Create a username for yourself (this step is interactive)
```bash
sudo -u postgres createuser --interactive
# put your username (i.e. whatever $(whoami) gives you)
# put 'y' for superuser
```

## get latest nodejs (Debian's latest nodejs version in apt is outdated as of 2020-09-06), and this solves that
```bash
curl https://www.npmjs.com/install.sh | sudo sh
```


## Install dependencies, set up database, etc...
```bash
npm install
# it'll probably complain about vulnerabilities in packages. run 'npm audit fix' to fix most, if not all, of these. 'npm audit fix --force' may be needed, though it may potentially break something (it didn't in my case)

npm run db:migrate
npm run db:seed:all
```

## Run the server
```bash
npm run start:dev
```
