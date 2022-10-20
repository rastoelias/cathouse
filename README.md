# Cathouse
Raspberry pi controlled cat shed.

## Initial config
To run the CatHouse app after reboot automaticaly.
```
crontab -e
```
Put following code, save and reboot:
```
@reboot /home/rastoelias/cathouse/start-stream.sh
@reboot sleep 30 && /home/rastoelias/cathouse/start-app.sh
```
> During development, open the required file and comment out the required line

## Development

Pushing changes to github
```
git push -u origin main
```

### Video network streaming
To start streaming run:
```
ssh rastoelias@192.168.0.29
libcamera-vid -t 0 --inline -o - | cvlc stream:///dev/stdin --sout '#rtp{sdp=rtsp://:8554/stream1}' :demux=h264
```

### CatHouse App
To run the CatHouse App run:
```
cd cathouse
node app.js
```

## Troubleshooting

### pigpio initCheckPermitted
```
2015-12-11 15:36:28 initCheckPermitted: 
+---------------------------------------------------------+
|Sorry, you don't have permission to run this program.    |
|Try running as root, e.g. precede the command with sudo. |
+---------------------------------------------------------+
Error: pigpio error -1 in gpioInitialise
```
The pigpio Node.js package uses the pigpio C library and the pigpio C library requires root privileges, so root privileges are needed. The pigpio deamon is not used, so starting it will not resolve the issue. The idea behind using the pigpio C library directly is to make things as fast possible. Typically, the node executable is owned by root and in /usr/bin:

```
pi@raspberrypi:/usr/bin $ ls -la node
lrwxrwxrwx 1 root root 6 Apr 12  2015 node -> nodejs
```
The setuid access right could be used to allow user pi to run node with the rights of root with the following command, but this is a not a good thing to do:

```
sudo chmod u+s /usr/bin/node
```