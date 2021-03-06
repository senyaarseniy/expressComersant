import {Field} from "./field";

export enum PlayerItems {
  purchaseAllowance,
  sequrityCard,
  freeTax
}

export class Player {
  private allPlayers: Player[];
  private name: string;
  private position: number;
  private rest: boolean;
  private payTax: boolean;
  private momey: number;
  private propertiesList: number[];
  private static idCounter: number = 0;
  private id: number;
  private socketId: string;
  private items: PlayerItems[];
  private isRacketir: number;

  public get SocketId() {
    return this.socketId;
  }


  /* TODO add: Status(ENUM: racket) / if racket remove sequrity
   *           credit: {remainingTime: number, credit}
   *           CollectableItems: {ENUM: "Г(buy city firma)", "Free from TAX-Visit", "Anti-racket"}[]
   *           events: {event: Function(MB), remainTurns: number}[]
   */
  constructor(name: string, allPlayers: Player[], socket: string) {
    // this.allPlayers = allPlayers;
    // avoid a serialisation af all player.
    Object.defineProperty(this, "allPlayers", {
        enumerable: false,
        value: allPlayers
    });
    this.name = name;
    this.position = 0;
    this.rest = false;
    this.momey = 250000;
    this.id = Player.idCounter++;
    this.propertiesList = [];
    this.socketId = socket;
    this.items = [];
    this.payTax = false;
    this.isRacketir = null;
  };

  public makeDeal(money: number, player: Player) {
    if(player === null) {
      this.allPlayers.forEach((player: Player) => {
        this.changeBallance(money);
        player.changeBallance(-money);
      });
    } else {
      this.changeBallance(money);
      player.changeBallance(-money);
    }
  }
  public getFoe(playerId: number): Player {
    return this.allPlayers.filter(val => val.getId() === playerId)[0];
  }
  public getSocket(): string {
    return this.socketId;
  }
  public getId() {
    return this.id;
  };
  public setTax(): void {
    this.payTax = true;
  };
  public haveToTax() {
    var tax = this.payTax;
    if(this.payTax) {
      this.payTax = false;
    }
    return tax;
  };
  public getName() {
    return this.name;
  };
  public getDivideds(field: Field) {
    var dividends = 0;
    this.propertiesList.forEach((id) => {
      field.getDividends
    });
    this.changeBallance(dividends);
  };
  public buyProperty(propId: number, costs: number) {
    /* to be sure */
    if(this.momey >= costs && this.propertiesList.indexOf(propId) !== -1) {
      this.propertiesList.push(propId);
      this.changeBallance(costs);
    }
  };
  public removeProperty(index: number) {
    var list = this.propertiesList;
    list.splice(list.indexOf(index), 1);
  };
  public getPropertiesList(): number[] {
    return this.propertiesList;
  };
  public getPosition(): number {
    return this.position;
  };
  public setPosition(position: number): number {
    if(this.isRacketir !== null && this.isRacketir > 0) {
      this.calcRacketTime(Math.abs(this.position - position));
    }
    return this.position = position;
  };
  private calcRacketTime(time: number) {
    this.isRacketir -= time;
    if (this.isRacketir < 0) {
      this.isRacketir = 0;
    }
  }
  public becomeRacketir(time: number) {
    this.isRacketir = time;
  };
  public removeRackteStatus() {
    if(this.isRacketir === 0) {
      this.isRacketir = null;
    }
  };
  public isRacket(): boolean {
    return this.isRacketir === null? false: true;
  };
  public setRest() {
    this.rest = true;
  };
  public haveToRest() {
    var sleep = this.rest;
    if(this.rest) {
      this.rest = false;
    }
    return sleep;
  };
  public changeBallance(delta: number) {
    var newBallance = this.momey + delta;
    if(newBallance < 0) {
      throw new NotEnoughMoneyError(newBallance);
    } else {
      this.momey = newBallance;
    }
  };
  public getBallance(): number {
    return this.momey;
  };
  public addItem(item: PlayerItems): void {
    this.items.push(item);
  };
  public removeItem(item: PlayerItems): void {
    var counter = this.items.indexOf(item);
    if(counter === -1) {
      throw new Error('Try to remove unexisting item');
    }
    this.items.splice(counter, 1);
  };
  public isThatPlayer(socketId: string) {
    return this.socketId === socketId;
  };
}

export class NotEnoughMoneyError extends Error {
  need: number;
  constructor(need: number, msg?: string) {
    super(msg);
    this.need = need;
  };
}
