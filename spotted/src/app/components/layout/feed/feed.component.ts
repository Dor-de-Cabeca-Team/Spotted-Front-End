import { Component, inject, HostListener } from '@angular/core';
import { PostService } from '../../../services/post/post.service';
import { PostDTO } from '../../../models/postDTO/post-dto';
import { PostComponent } from '../post/post.component';
import { CommentComponent } from '../comment/comment.component';
import { CommonModule } from '@angular/common';
import { CreatePostComponent } from "../create-post/create-post.component";
import { Router } from '@angular/router';
import { LoginService } from '../../../auth/login.service';
import { CommentDto } from '../../../models/commentDTO/comment-dto';
import { TredingComponent } from '../trending/treding.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentCommentDialog } from '../modal-comment/modal-comment.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [PostComponent, CommentComponent, CommonModule, CreatePostComponent, TredingComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent {
  dialog = inject(MatDialog);
  router = inject(Router);
  postService = inject(PostService);
  posts: PostDTO[] = [];
  selectedPostId: string | null = null;
  showModal: boolean = false;

  loginService = inject(LoginService);

  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 10;
  isLoading: boolean = false;

  constructor() {
    this.findAllValidos();
  }

  findAllValidos(page: number = 0, append: boolean = false) {
    const idUser = this.loginService.getIdUsuarioLogado();
    console.log('findAllValidos: idUser:', idUser, 'Page:', page);
    if (idUser) {
      this.isLoading = true;
      this.postService.findAllValidos(idUser, page, this.pageSize).subscribe({
        next: (data) => {
          const imagesLength = 20;
          const newPosts = data.content.map((post) => {
            const validComments: CommentDto[] = post.comments;
            const animalIndex = post.profileAnimal ?? 0;
            const animalImage = this.postService.getRandomAnimalImage(animalIndex % imagesLength);

            return {
              ...post,
              comments: validComments,
              imagem: animalImage.path,
              imagemNome: animalImage.name,
              liked: post.liked,
              reported: post.reported,
            };
          });

          this.posts = append ? [...this.posts, ...newPosts] : newPosts;

          this.currentPage = data.number;
          this.totalPages = data.totalPages;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error: ' + err);
          alert('Faça login novamente!');
          this.router.navigate(['/login']);
          this.isLoading = false;
        },
      });
    } else {
      console.error('User is not logged in');
      alert('Você precisa estar logado para ver os posts.');
    }
  }

  onPostCreated() {
    setTimeout(() => {
      this.findAllValidos(0, false);
    }, 1500);
  }

  loadMorePosts() {
    if (this.isLoading || this.currentPage + 1 >= this.totalPages) {
      return;
    }
    this.findAllValidos(this.currentPage + 1, true);
  }

  updatePost(idPost: string) {
    const idUser = this.loginService.getIdUsuarioLogado();
    if (idUser) {
      this.postService.findById(idPost, idUser).subscribe({
        next: (updatedPost) => {
          const index = this.posts.findIndex((post) => post.id === idPost);
          if (index !== -1) {
            this.posts[index] = {
              ...this.posts[index],
              ...updatedPost,
            };
          }
        },
        error: (err) => {
          console.error('Erro ao atualizar o post:', err);
        },
      });
    }
  }
  
}
