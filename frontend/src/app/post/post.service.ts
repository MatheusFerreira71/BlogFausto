import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment as env } from "./../../environments/environment";
import { Post } from "./Post";
import { Observable } from "rxjs";

interface PostData {
  _id: string;
  postId: Post;
}

@Injectable({
  providedIn: "root",
})
export class PostService {
  // Injeção de dependência: Em vez de criarmos manualmente as dependências
  // necessárias, o próprio Angular as cria e INJETA o objeto já instanciado
  // como parâmetro do construtor.
  constructor(private http: HttpClient) {}

  private apiUri: string = env.apiBaseUri + "posts";
  // private allPosts = [] as Post[];
  // private postsAnalises = [] as PostData[];

  listarAll(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUri);
  }

  excluir(id: string) {
    return this.http
      .request("DELETE", this.apiUri, {
        body: { _id: id },
      })
      .toPromise();
  }

  novo(body: any) {
    return this.http.post(this.apiUri, body).toPromise();
  }

  atualizar(body: any) {
    return this.http.put(this.apiUri, body).toPromise();
  }

  obterUm(id: string) {
    return this.http.get(this.apiUri + "/" + id).toPromise();
  }
}
