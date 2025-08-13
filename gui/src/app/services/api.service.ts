import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  Person,
  Category,
  Entry,
  Event,
  PageResponse,
} from "../models/entry.model";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  private apiUrl = "http://localhost:8081/api/v1";

  constructor(private http: HttpClient) {}

  getPersons(
    page = 0,
    size = 20,
    sort = "id,asc",
    name?: string,
    active?: boolean,
  ): Observable<PageResponse<Person>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sort", sort);

    if (name) params = params.set("name", name);
    if (active !== undefined) params = params.set("active", active.toString());

    return this.http.get<PageResponse<Person>>(`${this.apiUrl}/persons`, {
      params,
    });
  }

  getCategories(
    page = 0,
    size = 20,
    sort = "id,asc",
    name?: string,
    active?: boolean,
  ): Observable<PageResponse<Category>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sort", sort);

    if (name) params = params.set("name", name);
    if (active !== undefined) params = params.set("active", active.toString());

    return this.http.get<PageResponse<Category>>(`${this.apiUrl}/categories`, {
      params,
    });
  }

  getEntries(
    page = 0,
    size = 20,
    sort = "date,desc",
    filters?: any,
  ): Observable<PageResponse<Entry>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sort", sort);

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<PageResponse<Entry>>(`${this.apiUrl}/entries`, {
      params,
    });
  }

  createPerson(person: Person): Observable<Person> {
    return this.http.post<Person>(`${this.apiUrl}/persons`, person);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, category);
  }

  createEntry(entry: Entry): Observable<Entry> {
    return this.http.post<Entry>(`${this.apiUrl}/entries`, entry);
  }

  updatePerson(id: number, person: Person): Observable<Person> {
    return this.http.put<Person>(`${this.apiUrl}/persons/${id}`, person);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, category);
  }

  updateEntry(id: number, entry: Entry): Observable<Entry> {
    return this.http.put<Entry>(`${this.apiUrl}/entries/${id}`, entry);
  }

  deletePerson(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/persons/${id}`);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  deleteEntry(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/entries/${id}`);
  }

  getEvents(
    page = 0,
    size = 20,
    sort = "visitDate,desc",
    filters?: any,
  ): Observable<PageResponse<Event>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sort", sort);

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http.get<PageResponse<Event>>(`${this.apiUrl}/events`, {
      params,
    });
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(`${this.apiUrl}/events`, event);
  }

  updateEvent(id: number, event: Event): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/events/${id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${id}`);
  }

  // User Management
  getUsers(
    page = 0,
    size = 20,
    sortBy = "username",
    sortDir = "asc",
  ): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString())
      .set("sortBy", sortBy)
      .set("sortDir", sortDir);

    return this.http.get<PageResponse<any>>(`${this.apiUrl}/users`, { params });
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  activateUser(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  // Audit Management
  getAuditHistory(params: any): Observable<PageResponse<any>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<PageResponse<any>>(`${this.apiUrl}/audit`, {
      params: httpParams,
    });
  }

  getEntityAuditHistory(
    tableName: string,
    recordId: number,
    page = 0,
    size = 10,
  ): Observable<PageResponse<any>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<PageResponse<any>>(
      `${this.apiUrl}/audit/entity/${tableName}/${recordId}`,
      { params },
    );
  }

  // Logs Management
  getLogs(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<any>(`${this.apiUrl}/logs`, { params: httpParams });
  }

  getLogLevels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/logs/levels`);
  }

  getLogStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/logs/stats`);
  }

  // Reports
  getReportSummary(fromDate: string, toDate: string, personId?: number, categoryId?: number): Observable<any> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    
    if (personId) params = params.set('personId', personId.toString());
    if (categoryId) params = params.set('categoryId', categoryId.toString());

    return this.http.get<any>(`${this.apiUrl}/reports/summary`, { params });
  }
}
