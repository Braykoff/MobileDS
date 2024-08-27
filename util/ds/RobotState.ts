/** The control mode of the robot */
export enum ControlMode {
  Teleop = 0, Test, Autonomous
}

/** The driver station */
export enum DriverStationPosition {
  Red1 = 0, Red2, Red3, Blue1, Blue2, Blue3
}

/** Represents all the data being sent to the robot */
export class RobotStateData {
  public estop = false;
  public enabled = false;
  public mode = ControlMode.Teleop;
  public dsPosition = DriverStationPosition.Red1;
  public requestRoboRIOReboot = false; // Cleared once UDP packet is sent
  public requestCodeRestart = false; // Cleared once UDP packet is sent

  // Controller (imitates XBox controller)
  public joystickIndex = 0;
  public leftJoystickX = 0;
  public leftJoystickY = 0;
  public rightJoystickX = 0;
  public rightJoystickY = 0;

  public leftTrigger = false;
  public rightTrigger = false;
  public aButton = false;
  public bButton = false;
  public xButton = false;
  public yButton = false;
}
