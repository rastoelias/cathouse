#!/bin/bash
# libcamera-vid --rotation 180 -t 0 --inline -o - | cvlc stream:///dev/stdin --sout '#rtp{sdp=rtsp://:8554/stream1}' :demux=h264
libcamera-vid --nopreview --saturation 0.5 --awb tungsten --denoise cdn_fast --quality 100 --width 640 --height 480 --rotation 180 --framerate 30 -t 0 --inline -o - | cvlc stream:///dev/stdin --sout '#rtp{sdp=rtsp://:8554/stream1}' :demux=h264