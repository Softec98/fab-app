import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root'
})
export class DbService extends Dexie {

  constructor() {
    super("DexieDB");
    this.version(1).stores({
      myStore1: '++empId, empName, empSal',
      myStore2: 'compId, compName'
    });
    this.open()
      .then(data => console.log("DB Opened"))
      .catch(err => console.log(err.message));
  }
}