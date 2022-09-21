import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {WillDetails} from "../interfaces/will-details";

@Injectable({
  providedIn: 'root'
})
export class WillService {
  private willUrl: string = "http://localhost:9898/will";
  constructor(private http: HttpClient) { }

  getWill() {
    return this.http.get<WillDetails>(this.willUrl);
  }
  saveWill(data: WillDetails) {
   return this.http.post(this.willUrl, data);
  }
}
