import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment as env } from '../../environments/environment';

export interface User {
  nome: string
  username: string
  email: string
  bio?: string
  avatar?: string
  isAdm: boolean
  uniqueId: string
}

export interface ReturnedUser extends User {
  _id: string
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUri = `${env.apiBaseUri}usuarios`;
  constructor(private http: HttpClient) { }

  createUser(body: User): Observable<ReturnedUser> {
    return this.http.post<ReturnedUser>(this.apiUri, body);
  }

  findByUsername(username: string): Observable<ReturnedUser> {
    return this.http.get<ReturnedUser>(`${this.apiUri}/user-ver/${username}`);
  }
}
