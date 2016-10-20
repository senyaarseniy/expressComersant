import {Player} from "./player";
import {PlayerItems} from "./player";
import NotificationService from "./services/notification";

export class Field {
  private that: Field;
  private fields: Cell[];
  constructor() {
    this.that = this;
    this.fields = [];
    this.fields.push(
      new FirmaCell(30000, 200, "Гастроном", 21000),
      new FirmaCell(32000, 250, "Кондитерский", 24000),
      new FirmaCell(34000, 300, "Хлебный", 26000),
      new ChangeBallanceEvent(new MoneyEvent("Прибыль", "Поздравляем! Вы выйграли в лотерею 10 000", 10000)),
      new ChangeBallanceEvent(new MoneyEvent("Штраф", "Вас оштрафовали на 25 000", -25000)),
      new ChangeBallanceEvent(new MoneyEvent("Прибыль", "Поздравляем! Вы выйграли в лотерею 10 000", 10000))
    );
  };
  public callEvent(player: Player) {
    this.fields[player.getPosition()].onStep(player, this.that);
  };
  public getLength(): number {
    return this.fields.length;
  }
  public isPurchasable(player: Player, propId: number): boolean {
    if(this.fields[propId].isPurchasable()) {
      var field:PropertyCell = <PropertyCell>this.fields[propId];
      return !field.isSold() && (player.getBallance() >=  field.getPrice());
    } else {
      return false;
    }
  }
  public purchaseProp(player: Player, propId: number) {
    var property: PropertyCell = <PropertyCell>this.fields[propId];
    if(this.fields[propId].isPurchasable() && player.getBallance() >= property.getPrice()) {
      player.buyProperty(propId, property.getPrice());
      property.setOwner(player.getId());
      console.log('Bought', property.getName())
    } else {
      throw new Error('WRONG PROPERTY TO BUY');
    }
  }
  public changeOwner(player: Player, propId: number) {
    /* TODO */
  }
}
/* Main Super-Class */
abstract class Cell {
  public isPurchasable(): boolean {
    return this.purchasable;
  }
  protected purchasable: boolean;
  public abstract onStep(player: Player);
  constructor() {
    this.purchasable = false;
  };
}
/* Card and Events */
abstract class EventCell extends Cell {
  public abstract onStep(player: Player);
}

class Card extends EventCell {
  eventArray: ((player: Player) => void)[]
  constructor(eventArray: ((player: Player) => void)[]) {
    super();
    this.eventArray = eventArray;
  };
  public onStep(player: Player) {};
}

class ChangeBallanceEvent extends EventCell {
  private event: StepEvent;
  public onStep(player: Player){
    console.log('some money event');
    this.event.dispatch(player);
  };
  constructor(event: StepEvent) {
    super();
    this.event = event;
  };
}
/* Events */
abstract class StepEvent {
  public abstract dispatch(player: Player);
}

class CardEvent extends StepEvent {
  private event: (player: Player) => void;
  constructor(event: (player: Player) => void) {
    super();
    this.event = event;
  };
  public dispatch(player: Player) {
    this.event(player);
  }
}

class MoneyEvent extends StepEvent {
  message: string;
  headLine: string;
  deltaBallance: number;
  constructor(headLine: string, message: string, deltaBallance: number) {
    super();
    this.message = message;
    this.headLine = headLine;
    this.deltaBallance = deltaBallance;
  };
  public dispatch(player: Player) {
    /* TODO SEND MESSAGE */
    // showMessageFn();
    player.changeBallance(this.deltaBallance);
  };
}

/* Properties */
abstract class PropertyCell extends Cell {
  private price: number;
  private ownerId: number;
  private dividend: number;
  private name: string;
  constructor(price: number, dividend: number, name: string) {
    super();
    this.price = price;
    this.ownerId = null;
    this.dividend = dividend;
    this.purchasable = true;
    this.name = name;
  };
  public isSold() {
    return this.ownerId !== null;
  }
  public getOwner() {
    return this.ownerId;
  }
  public getName() {
    return this.name;
  }
  public setOwner(newOwnerId: number): number {
    return this.ownerId = newOwnerId;
  }
  public getPrice() {
    return this.price;
  }
  public abstract onStep();
}

class FirmaCell extends PropertyCell {
  private static gradeMultipliese: number[] = [1, 3, 12.5, 30];
  private static maxGrade: number = 4;
  private grade: number;
  private upgradePrice: number;
  constructor(price: number, dividend: number, name: string, uPrice: number) {
    super(price, dividend, name);
    this.grade = 0;
    this.upgradePrice = uPrice;
  };
  public onStep() {
    console.log('if no owner, offer to buy,/ else getTax');
  };
}

class AreaCell extends PropertyCell {
  constructor(price: number, dividend: number, name: string) {
    super(price, dividend, name);
  };
  public onStep() {
    console.log('if no owner, offer to buy');
  };
}


/* */
var mailArray: CardEvent[] = [
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-1000);
    NotificationService.sendNotification(player, "Письмо", "Оплатите телефонные переговоры 1 000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-20000);
    NotificationService.sendNotification(player, "Письмо", "Ремонт предприятий обходиться вам в 20 000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.addItem(PlayerItems.purchaseAllowance);
    NotificationService.sendNotification(player, "Письмо", "Вам разрешено купить государственное предприятие");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(8000);
    NotificationService.sendNotification(player, "Письмо", "Доход региональныйх фелиалов 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(25000);
    NotificationService.sendNotification(player, "Письмо", "Получите наследство 25000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setPosition(field.getFieldId("Тюз"));
    NotificationService.sendNotification(player, "Письмо", "Вам купили билеты на спектакль в тюз");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-15000);
    NotificationService.sendNotification(player, "Письмо", "Регистрация организаций обходиться вам в 15000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-24000);
    NotificationService.sendNotification(player, "Письмо", "Штраф за сокрытие доходов 24000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setPosition(field.getFieldId("театр оперы и балета"));
    NotificationService.sendNotification(player, "Письмо", "Вам купили билеты в театр оперы и балета");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-5000);
    NotificationService.sendNotification(player, "Письмо", "Штраф пожнадзору 5000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(15000);
    NotificationService.sendNotification(player, "Письмо", "Вы выгодно сбыли товар 15000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(10000);
    NotificationService.sendNotification(player, "Письмо", "Получите годовой % 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-8000);
    NotificationService.sendNotification(player, "Письмо", "Оплатите штраф гаи 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-12000);
    NotificationService.sendNotification(player, "Письмо", "Расходы на модернизаию производства 12000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-10000);
    NotificationService.sendNotification(player, "Письмо", "Штраф за неуплату налогов 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(10000);
    NotificationService.sendNotification(player, "Письмо", "Доход аренды приносит 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.addItem(PlayerItems.freeTax);
    NotificationService.sendNotification(player, "Письмо", "Вы освобождены от посещения налоговой службы");
  }),
  new CardEvent((player: Player, field: Field) => {
    surprizeArray[Math.floor(Math.random() * surprizeArray.length)].dispatch(player, field);
    NotificationService.sendNotification(player, "Письмо", "Тащите карту сюрприз");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-18000);
    NotificationService.sendNotification(player, "Письмо", "Канкуренты нанесли вам убыток 18000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setTax();
    NotificationService.sendNotification(player, "Письмо", "Вас вызывают в налоговую службу");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-11000);
    NotificationService.sendNotification(player, "Письмо", "Оплатите счёт 11000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setTax();
    NotificationService.sendNotification(player, "Письмо", "Вас вызывают в налоговую службу");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.addItem(PlayerItems.freeTax);
    NotificationService.sendNotification(player, "Письмо", "Вы освобождены от посещения налоговой службы");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-5000);
    NotificationService.sendNotification(player, "Письмо", "Оплатите счёт 5000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(12000);
    NotificationService.sendNotification(player, "Письмо", "Получите годовой % 12000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.addItem(PlayerItems.purchaseAllowance);
    NotificationService.sendNotification(player, "Письмо", "Вам разрешено купить государственное предприятие");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-5000);
    NotificationService.sendNotification(player, "Письмо", "Оплатите авиабилеты 5000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-10000);
    NotificationService.sendNotification(player, "Письмо", "Заплатите налог на экспорт 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-8000);
    NotificationService.sendNotification(player, "Письмо", "Оплатите ремонт служебного транспорта 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setPosition(field.getFieldId("Ресторан"));
    NotificationService.sendNotification(player, "Письмо", "Поситите банкет в ресторане");
  }),
  new CardEvent((player: Player, field: Field) => {
    riskArray[Math.floor(Math.random() * surprizeArray.length)].dispatch(player, field);
    NotificationService.sendNotification(player, "Письмо", "Тащите карту риск");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(10000);
    NotificationService.sendNotification(player, "Письмо", "Получите дивиденты от прибыли 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(15000);
    NotificationService.sendNotification(player, "Письмо", "Получите проценты по вкладам 15000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(25000);
    NotificationService.sendNotification(player, "Письмо", "Вам предоставлен президентский гранд 25000");
  })
];
var riskArray = [];
var surprizeArray: CardEvent[] = [
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(12000);
    NotificationService.sendNotification(player, "Сюрприз", "Вы примеруетесь на 12000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setTax();
    NotificationService.sendNotification(player, "Сюрприз", "Вас вызывают в налоговую службу");
  }),
  new CardEvent((player: Player, field: Field) => {
    var newPosition = player.getPosition() - 5;
    if(newPosition < 0) {
      newPosition = field.getLength() + newPosition;
    }
    player.setPosition(newPosition);
    NotificationService.sendNotification(player, "Сюрприз", "Вернитесь на 5 клеток назад");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setTax();
    NotificationService.sendNotification(player, "Сюрприз", "Вас вызывают в налоговую службу");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(10000);
    NotificationService.sendNotification(player, "Сюрприз", "Вы выйграли в 'Спринт' 10000");
  }),
  // new CardEvent((player: Player, field: Field) => {
  //   NotificationService.sendNotification(player, "Сюрприз", "Определите клетку куда должен встать игрок справа");
  // }),
  new CardEvent((player: Player, field: Field) => {
    player.setPosition(field.getFieldId("Концертный зал"));
    NotificationService.sendNotification(player, "Сюрприз", "Вам подарили билет в концертный зал");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setRest();
    NotificationService.sendNotification(player, "Сюрприз", "Лечение в санатории 'Геленджик'");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(12000);
    NotificationService.sendNotification(player, "Сюрприз", "Вы выйграли приз в телевикторине 12000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(25000);
    NotificationService.sendNotification(player, "Сюрприз", "Вы примеруетесь на 25000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(25000);
    NotificationService.sendNotification(player, "Сюрприз", "Вы примеруетесь на 25000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-8000);
    NotificationService.sendNotification(player, "Сюрприз", "Заплатите штраф 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    var newPosition = player.getPosition() - 10;
    if(newPosition < 0) {
      newPosition = field.getLength() + newPosition;
    }
    player.setPosition(newPosition);
    NotificationService.sendNotification(player, "Сюрприз", "Вернитесь на 10 клеток назад");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.makeDeal(8000, null);
    NotificationService.sendNotification(player, "Сюрприз", "У вас родилась дочь. Все игроки дарят по 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-40000);
    NotificationService.sendNotification(player, "Сюрприз", "Ограбленна касса на сумму 40000");
  }),
  new CardEvent((player: Player, field: Field) => {
    var newPosition = player.getPosition() + 5;
    if(newPosition >= field.getLength()) {
      newPosition = field.getLength() - newPosition;
    }
    player.setPosition(newPosition);
    NotificationService.sendNotification(player, "Сюрприз", "Подвиньтесь на 5 клеток вперёд");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setPosition(field.getFieldId("Лужники"));
    NotificationService.sendNotification(player, "Сюрприз", "Вы приглашены на концерт в лужниках");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(5000);
    NotificationService.sendNotification(player, "Сюрприз", "Вам отдали карточный долг 5000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(5000);
    NotificationService.sendNotification(player, "Сюрприз", "Вам отдали карточный долг 5000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(20000);
    NotificationService.sendNotification(player, "Сюрприз", "Помощь от неизвестного доброжелателя 20000");
  }),
  // new CardEvent((player: Player, field: Field) => {
  //   NotificationService.sendNotification(player, "Сюрприз", "Определите клетку куда должен встать игрок справа");
  // }),
  new CardEvent((player: Player, field: Field) => {
    var newPosition = player.getPosition() + 10;
    if(newPosition >= field.getLength()) {
      newPosition = field.getLength() - newPosition;
    }
    player.setPosition(newPosition);
    NotificationService.sendNotification(player, "Сюрприз", "Подвиньтесь на 10 клеток вперёд");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.makeDeal(10000, null);
    NotificationService.sendNotification(player, "Сюрприз", "У вас юбилей. Все игроки дарят по 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(12000);
    NotificationService.sendNotification(player, "Сюрприз", "Вы выйграли в 'Спортлото' 12000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(15000);
    NotificationService.sendNotification(player, "Сюрприз", "Вам перевод 15000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-5000);
    NotificationService.sendNotification(player, "Сюрприз", "Заплатите штраф 5000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setPosition(field.getFieldId("Институт культуры"));
    NotificationService.sendNotification(player, "Сюрприз", "Посетите семинар в институте культуры");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(10000);
    NotificationService.sendNotification(player, "Сюрприз", "Скачок курса акции приносит 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(8000);
    NotificationService.sendNotification(player, "Сюрприз", "Прибыль с участия в аукционе 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-12000);
    NotificationService.sendNotification(player, "Сюрприз", "Премируйте лучших сотрудников 12000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-8000);
    NotificationService.sendNotification(player, "Сюрприз", "Расходы на корпоротив 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-10000);
    NotificationService.sendNotification(player, "Сюрприз", "Неудачные инвестиции, убыток 10000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-5000);
    NotificationService.sendNotification(player, "Сюрприз", "Упал курс доллара убытки 5000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-5000);
    NotificationService.sendNotification(player, "Сюрприз", "Переезд в новый офис обходиться в 12000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(-8000);
    NotificationService.sendNotification(player, "Сюрприз", "Оплатите аренду офиса 8000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setRest();
    NotificationService.sendNotification(player, "Сюрприз", "Отпуск на курортах краснодарского края");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.changeBallance(15000);
    NotificationService.sendNotification(player, "Сюрприз", "Вы удачно сбыли антиквариат 15000");
  }),
  new CardEvent((player: Player, field: Field) => {
    player.setPosition(field.getFieldId("Кафе"));
    NotificationService.sendNotification(player, "Сюрприз", "Партнёры предложили вам встречу в кафе");
  })
];
