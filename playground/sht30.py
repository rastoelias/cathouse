#!/usr/bin/python3
# -*- coding: utf-8 -*-
# https://github.com/ma-lu-yao/sht30/blob/main/sht30.py

import smbus
import time
import getopt,sys
from decimal import Decimal
def usage():
    sys.stderr.write("""USAGE: %s [options]
    SHT30 Sensor Reader for Raspberry
    options:
    -h, --help:     show this usage.
    -b, --busid=    I2C busid,default 1
    -a, --addr=     I2C addr default 0x44
    -t              Show Temperature only, Ingore Humidity
    -c|-k|-f        Show Temperature in Celsius(default), Kelvin or Fahrenheit
    -v, --version   show version
""" % (sys.argv[0], ))
def getValue():
    return 3
def main():
    busid=1
    addr=0x44
    version=0.1
    tempStd=0 # 0 Celsius , 1 Kelvin, 2 Fahrenheit
    isShowHumidity=1
    try:
        opts, args = getopt.getopt(sys.argv[1:], "hb:a:vcfkt", ["help", "busid=","addr="])
    except getopt.GetoptError as err:
        print("###Parameter Wrong!###")
        usage()
        sys.exit(2)
    output = None
    verbose = False
    optnames = [opt[0] for opt in opts]
    if (("-c" in optnames and "-k" in optnames ) or  ("-c" in optnames and "-f" in optnames ) or ("-k" in optnames and "-f" in optnames )):
        print("-c and -k and -f are Mutually Exclusive", file=sys.stderr)
        sys.exit(2)
    for o, a in opts:
        if o == "-v":
            print ("SHT30 Reader for Raspberry,Version "+ str(version))
            sys.exit(0)
        elif o in ("-h", "--help"):
            usage()
            sys.exit(0)
        elif o in ("-c"):
            tempStd=0
        elif o in ("-k"):
            tempStd=1
        elif o in ("-f"):
            tempStd=2
        elif o in ("-t"):
            isShowHumidity=0
        elif o in ("-b", "--busid"):
            busid= int(a)
        elif o in ("-a", "--addr"):
            addr= int(eval(a))
        else:
            assert False, "unhandled option"
    try:
        i2c = smbus.SMBus(busid)
    except :
        print("Error, Please Check I2c BusID, I2C address  and the  permission of I2C device")
        sys.exit(2)
    i2c.write_byte_data(addr,0x23,0x34)
    time.sleep(0.5)
    i2c.write_byte_data(addr,0xe0,0x0)
    data = i2c.read_i2c_block_data(addr,0x0,6)
    rawT = ((data[0]) << 8) | (data[1])
    temp = (-45 + rawT * 175 / 65535)
    if (tempStd==0): # Celsius
        temp = Decimal(temp).quantize(Decimal("0.00"))
        tempstr = str(temp)+' \u2103'
    if (tempStd==1): # Kelvin
        temp=temp+273.15
        tempstr = str(Decimal(temp).quantize(Decimal("0.00")))+' \u212a'
    if (tempStd==2): #Fahrenheit
        temp=(temp*1.8)+32.0
        tempstr = str(Decimal(temp).quantize(Decimal("0.00")))+' \u2109'
    print(tempstr)
    if (isShowHumidity):
        rawR = ((data[3]) << 8) | (data[4])
        RH =   (100 * rawR       / 65535) 
        RH =Decimal(RH).quantize(Decimal("0.00"))
        print (str(RH)+'%')
if __name__ == "__main__":
    main()