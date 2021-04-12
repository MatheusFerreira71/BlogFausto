import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FirebaseService } from '../auth/firebase.service';
import { ConfirmDialogComponent } from '../ui/confirm-dialog/confirm-dialog.component';
import { UserService, User, ReturnedUser } from './user.service'
import { Observable, timer } from 'rxjs'
import { Store } from '@ngrx/store'
import { State } from '../store/store';
import { setUser } from '../store/actions';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
@Component({
  selector: 'app-sign-up-form',
  templateUrl: './sign-up-form.component.html',
  styleUrls: ['./sign-up-form.component.scss']
})
export class SignUpFormComponent implements OnInit {
  admLog = false;
  hide = true;
  hideConfirm = true;
  confirmPassword: string;
  email: string;
  nome: string;
  username: string;
  bio: string;
  isAdm: boolean;
  password: string;
  avatarImage: File;
  avatar: string;
  user$: Observable<ReturnedUser>
  upPercentage$: Observable<number>

  constructor(
    private routes: ActivatedRoute,
    private userSrv: UserService,
    private firebaseSrv: FirebaseService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog,
    private store: Store<State>
  ) {
    this.user$ = this.store.select('user')
  }

  ngOnInit(): void {
    const route = this.routes.snapshot.routeConfig.path;
    if (route === 'adm-sign-up') {
      this.admLog = true
    }
  }

  setUser(user: ReturnedUser): void {
    this.store.dispatch(setUser({ payload: user }));
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();

  handleSubmit(f: NgForm) {

    if (!this.admLog) {
      this.isAdm = false
    }
    if (f.valid) {
      this.userSrv.findByUsername(this.username).subscribe(returnedUser => {
        if (!returnedUser) {
          this.firebaseSrv.signUpWithEmail(this.email, this.password).then(res => {
            const tarefaUpload = this.firebaseSrv.uploadFile(`avatars/${this.avatar}`, this.avatarImage);
            this.upPercentage$ = tarefaUpload.percentageChanges()
            tarefaUpload.then(() => {
              timer(1000).subscribe(() => {
                const user: User = {
                  email: this.email,
                  nome: this.nome,
                  username: this.username,
                  bio: this.bio,
                  isAdm: this.isAdm,
                  uniqueId: res.user.uid,
                  avatar: this.avatar
                }
                this.userSrv.createUser(user).subscribe(returnedUser => {
                  this.setUser(returnedUser);
                  this.router.navigate(['/']).then(() => {
                    this.snackBar.open(`Usuário Criado com Sucesso ✓`, "Entendi", {
                      duration: 5000,
                    })
                  })
                })
              })
            }).catch(err => {
              this.snackBar.open(`Algo deu errado! ❌ ${err} `, "Entendi", {
                duration: 5000,
              });
            })
          }).catch(err => {
            this.snackBar.open(`Algo deu errado! ❌ ${err} `, "Entendi", {
              duration: 5000,
            });
          })
        } else {
          this.snackBar.open("Nome de usuário não disponível! ❌ 🦦", "Entendi", {
            duration: 5000,
          });
        }
      })
    }
  }

  async voltar(f: NgForm) {
    let result = true;
    if (f.dirty && f.touched) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        data: { question: "Há dados não salvos. Deseja realmente voltar?" },
      });

      result = await dialogRef.afterClosed().toPromise();
    }
    if (result) {
      this.router.navigate(['/'])
    }
  }

  handleFileInput(file: File) {
    if (
      file.type === "image/jpg" ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/bmp"
    ) {
      this.avatarImage = file;
      const hash = Math.floor(Math.random() * (9999999999 - 1000000000 + 1) + 1000000000)
      this.avatar = `${hash}-${file.name}`;
    } else {
      this.snackBar.open(
        "Selecione um arquivo JPG / JPEG / PNG / BMP",
        "Entendi",
        { duration: 5000 }
      );
    }
  }
}
