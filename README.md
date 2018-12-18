# metarobot

## Prepare OS (Debian 9)

```sh
useradd --home-dir /home/bot --create-home --shell /bin/bash bot
passwd bot

usermod -g staff bot **optional**

apt-get update
apt install -y sudo mg git curl htop mc tree whois openssl
apt install -y build-essential protobuf-compiler python \
    libprotobuf-dev libcurl4-openssl-dev libboost-all-dev \
    libncurses5-dev libjemalloc-dev wget m4 clang libssl1.0-dev
apt-get upgrade -y
```

## Install environment

- Use non-root user.

```sh
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
nvm install node
curl -o- -L https://yarnpkg.com/install.sh | bash
yarn global add now (or npm install -g now)
now login
```

## Install metarobot

```sh
git clone https://github.com/caffellatte/metarobot.git
cd metarobot
yarn
```

## Configure *.env*

```txt
BOT_TOKEN=12345:QWERTYQWERTYQWERTYQWERTYQWERTY
RETHINKDB_HOST=100.100.100.100
RETHINK_PORT=28015

```

## RethinkDB

### as non-root (using bot user)

```sh
cd ~
mkdir opt
wget https://download.rethinkdb.com/dist/rethinkdb-2.3.6.tgz
tar xf rethinkdb-2.3.6.tgz
./configure --prefix=/home/bot/opt --allow-fetch CXX=clang++
make -j <total number of CPU cores>
make install
mkdir /home/bot/opt/var/run/rethinkdb/instance1
cd  /home/bot/opt/etc/rethinkdb/instances.d/
wget https://raw.githubusercontent.com/caffellatte/metarobot/util/instance1.conf
```

- .bashrc

```txt
export PATH="$HOME/opt/bin:$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
```

### as root

```sh

cd /etc/init.d
wget https://raw.githubusercontent.com/caffellatte/metarobot/util/rethinkdb
update-rc.d rethinkdb defaults
```

- edit /etc/sudoers

```sh
sudo visudo
```

add:

```txt
bot ALL = /etc/init.d/rethinkdb
```



## Usage

```sh
$ npm install
$ BOT_TOKEN='123:......' npm run dev
```

```sh
$ yarn
$ BOT_TOKEN='123:......' yarn dev
```

## Deployment

This bot can be deployed to [now](https://zeit.co/now) by Zeit.
Assuming you've got `now` installed and set up:

```sh
$ now
```
