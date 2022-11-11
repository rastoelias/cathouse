import smbus

bus = smbus.SMBus(1)

test = bus.read_byte(0x29)

print(test)