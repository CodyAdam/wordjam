# WordJam

WordJam is a Scabble like mass multiplayer game. The goal is to win points by placing words attached to others.

![screenshot](docs/Screenshot_20231011_143839.png)
![screenshot](docs/Screenshot_20231011_143824.png)
![screenshot](docs/Screenshot_20231011_143624.png)
![screenshot](docs/Screenshot_20231011_143755.png)

# Members

- Arthur ALLAIN
- [Cody ADAM](https://github.com/CodyAdam)
- [Fabien GOARDOU](https://fabiengoardou.fr/)
- [Mael KERICHARD](https://mael.app/)
- [Romain BRIEND](https://romainbriend.com/)

# Planning
| Start | End   | Description |
| ----- | ----- | ----------- |
|       | 03/04 | Development |
| 03/04 | 10/04 | Test week   |
| 10/04 | 17/04 | Gaming week |

# Try it
Try the game at one of those links :
- https://wordjam.fun/


# Host it yourself
Clone the project or copy the [Docker Compose](compose.yml)  
Then, launch the server by running this command line :
```shell
docker compose up -d
```

# Build the project

## Development
With a database launched on your side, configure the [.env](.env) file.  
Then, run the front and backend with this command :

```shell
turbo run dev
```

## Production
Build and run the production docker with this command :
```shell
docker compose -f compose.dev.yml build # Build the images
docker compose -f compose.dev.yml up -d # Run the images
docker compose -f compose.dev.yml push # Pulish on docker hub (change the name of the images on the compose file)
```
