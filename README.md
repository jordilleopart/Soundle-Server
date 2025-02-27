# Soundle-Server
Server side of the Soundle web application developed for the ECV course at UPF, 2025.

This document contains all the necessary information to use and deploy the server on a machine, and to run it either locally or hosted in the cloud (Azure, AWS, etc.)

At the moment of writing this document, the server is being hosted at [http://20.117.184.75/Soundle-Client/html/login.html](http://20.117.184.75/Soundle-Client/html/login.html).

The document is thought to distinguish 2 different deployments:

- [Running locally](#running-locally)
- [Running on the cloud](#running-on-the-cloud)

However, there are some steps that are common:

- [Installation of node modules](#installation-of-node-modules)
- [Required environment variables](#required-environment-variables)

Please follow the corresponding guide carefully and in order, to ensure the installations and configurations are done correctly.

# Running locally

To run the server in your local machine, you will need to install `node.js`, `npm` and `mysql`.

Once you have them all installed, you need to follow the instructions in [Installation of node modules](#installation-of-node-modules).

If you have all node modules installed, the last thing you need to do is to set your environment variables, which specify the secrets (API keys, passwords, etc) you need to run the server. 

To know which environment variables you need for this server, go to [Required environment variables](#required-environment-variables).

Lastly, if you have completed all above, you can succesfully run the server locally. For this, there are 2 commands.

The command below executes the server, and if you make any changes to its code while it's active, it will automatically restart the server. This is perfect to use in development.

```bash
npm run dev
```

This command below just executes the server. This is used in "production", once you have a final/stable version of your server, and you don't plan to introduce more changes.

```bash
npm run start
```

> [!WARNING]
> With the above 2 commands, if you close the terminal, the server will stop executing.
> If you want the server to be up and running 24/7, you can use tools such as [PM2](https://pm2.keymetrics.io/) as explained later in [Running on the cloud](#running-on-the-cloud).

## Installation of node modules

The repository comes with 2 files in its root folder: [package.json](package.json) and [package-lock.json](package-lock.json). 

These 2 files are the ones that describe the project and its dependencies. This makes it very easy to install the exact dependencies the developers where using, to ensure there are no problems.

To install all required dependencies, execute this command at the root folder of the project.

```bash
npm install
```

## Required environment variables

Here is a list of the used variables and their description:

- PORT: defines the port at which your server will be listening.
- MYSQL_HOST: specifies where is the MySQL server we want to access.
- MYSQL_USER: specifies the user that will be accessing the MySQL database.
- MYSQL_PASSWORD: password for the MySQL user.
- MYSQL_DB: specifies the database we want to access.
- MYSQL_PORT: specifies the port at which the MySQL server is listening. Default is 3306, but if you have a custom installation, it can be another.
- PASSWORD_SALT: salt string used for encrypting user passwords in our database.
- JWT_SECRET_TOKEN: secret token used to generate the JWT access tokens our server uses to authenticate/authorize users.

> [!WARNING]
> Remember to modify your environment variables of the `.env` file when changing deployment from local to the cloud, as the URLs may change.

# Running on the cloud

Deploying on the cloud is fairly similar to deploying locally, but adjusting the environment variables and some extra configurations explained in [VM creation](#vm-creation).

Once we have out Virtual Machine properly created and configure, we need to install the needed softwares. For this, proceed to [Software installation on VM](#software-installation-on-vm).

If we have finished installing and configuring the required softwares, we can now proceed to deploy our code by following [Code deployment with Git](#code-deployment-with-git).

> [!IMPORTANT]
> Do not forget to check that your .env file is correct as explained in [Required environment variables](#required-environment-variables)

Lastly, we can run the server in the same way as before, as seen in [Running locally](#running-locally), or, as we are in a VM that is technically a "server" that will be up and running 24/7, we can use more advanced tools such as PM2.

### Installing and using PM2

[PM2](https://pm2.keymetrics.io/) is a daemon process manager that will help you manage and keep your application online 24/7. This means that your server will continue running when you exit the connection to the VM.

To install it, use:

```bash
npm install pm2 -g
```

This will make pm2 globally available.

> [!WARNING]
> To install PM2 you will first need to install npm as said in [Software installation on VM](#software-installation-on-vm).

Then, you can perform a list of actions to start or finish your processes (e.g. node programs running, in our case the server).

```bash
# To start the server
pm2 start server.js
# To stop its execution
pm2 stop server.js
# To restart the server
pm2 restart server.js
# To stop and delete server
pm2 delete server.js

# To see all processes running
pm2 list
# To monitor CPU usage, etc
pm2 monit
```

There are many more options, detailed [here](https://pm2.keymetrics.io/docs/usage/process-management/).

## VM creation

First, you need to select the Cloud Service you will be using. In our case we used Azure. The steps we followed are the following.

1. Create an account (if you don't have one already)
2. Create a new VM and configure it. Relevant configurations:

    - OS and architecture selected.
    - Size of the VM (check pricings).
    - User definition.
    - SSH keys (type and name).
    - Select inbound open ports for SSH, HTTP and HTTPS (22, 80, and 443) respectively.
    - Disk type and size for the OS.
    - Disk creation (disk for our program): type, name and size.

> [!IMPORTANT]
> When accepting the creation, save the private key to your computer!

3. Open the port your server will be listening to, so that the client can connect to it. To do so, select `Networking` -> `Network settings` -> `Create Port rule` -> `Inbound Port rule`. Here you can select many options, such as the protocol you allow/deny, specify the source port you allow/deny, etc. The important things is that in `Destination port ranges` you put your server port, and allow it.

#### Connecting to the VM

Once you have the VM set up, to access it you have to select `Connect` -> `Native SSH`. Then, you paste the path to your private key (`.pem`), and copy the command that is below. It will have this form:

```bash
ssh -i <path> agonzalez@20.117.184.75
```

## Software installation on VM

Here we will explicitly explain how we installed everything on our VM. It is important to remark that we are using an `Azure VM with Ubuntu Server 24.04`. The installation may change depending on the VM's OS.

> [!NOTE]
> Before installing anything, you should always update (and upgrade) your system. To do so, use this:

```bash
# Updates the system
sudo apt update
# Applies upgrades if any (optional)
sudo apt upgrade
```

The upgrade step is optional but it is a good practice.

### Installing Apache

After performing an update (and upgrade), we can install apache as follows:

```bash
sudo apt install apache2
```

This is it! Simple, right? We can further configure the Apache if we want, as explained [here](https://ubuntu.com/tutorials/install-and-configure-apache#2-installing-apache).

### Installing MySQL

Once again, after the update, we install MySQL server by running:

```bash
sudo apt install mysql-server
```

You will be prompted to confirm the installation, and to configure some aspects like the password for root `user`, etc.

For more info, look [here](https://www.digitalocean.com/community/tutorials/how-to-install-lamp-stack-on-ubuntu#step-2-installing-mysql).

> [!TIP]
> Once mysql-server is installed, you can manually access the databases by running the command below and entering tour password:

```bash
mysql -u root -p
```

Lastly, we can install `phpMyAdmin` optionally, to use it as a GUI for MySQL. The steps are described [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-secure-phpmyadmin-on-ubuntu-20-04#step-1-installing-phpmyadmin).


### Installing Node.js and npm

We need to install both `Node.js` and `npm` to execute our server. After having done the update mentioned above, run these commands.

```bash
# Install node.js
sudo apt install nodejs
```

```bash
# Install npm
sudo apt install npm
```

You can check if they are installed properly using `node -v` and `npm -v`.

## Code deployment with Git

As we are working with private repositories, in order to perform any Git action such as clone, push, pull, etc. we need to create a fine-grained token that authorizes us to do so.

### Creation of fine-grained token

To create the fine-grained token, we must follow the following steps:

1. Go to `Settings` -> `Developer Settings` -> `Personal access tokens` and then choose `Fine-grained tokens`. Click `Generate new token`.

2. Give a name to your token and choose the organization that has the repositories as `Resource Owner`. Choose `Only select repositories`, and select your repositories from the dropdown menu.

3. After that, you need to specify the Repository permissions. If you want to be able to clone, pull and push a private repo, make `contents` as `Access: read and write`.

4. Finally click `Generate token` button. It will show you the token in order for you to copy it.

> [!IMPORTANT]
> Save the token in a safe place as you will only be able to see it once.

5. Once you get the token, copy it and in your VM, in the desired folder, run:

```bash
git clone https://oauth2:<TOKEN>@github.com/<your_user>/<your_repo>.git
```

### Repository placement

We want to deploy both the server and the client in the same VM. Apache will serve the client content for us. Then, we need to decide where to place our repositories.

In our case, we placed the server in our `home/<user>` folder, using the command above.

For the client, we need to put it in the folder that Apache is making public, that is `/var/www/html/`.

Depending on how you have configured your Apache and your user permissions for that folder, you may or may not need to use `sudo` to place your repository and apply `Git` actions to it.

However, the procedure does not change, it is the same command as above with the appropiate repository and `sudo` before if needed.

> [!IMPORTANT]
> Do not forget that in the server folder you need to run the command below for installing the dependencies as explained in [Installation of the node modules].(#installation-of-node-modules)

```bash
npm install
```

## Troubleshooting

When deploying the server and client in the VM, you may experience some problems.

One of the most common will be due to CORS, please check your CORS configuration on the server and the requests you are making from the client, to ensure it is correct.