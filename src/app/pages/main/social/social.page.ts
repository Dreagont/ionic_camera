import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { orderBy } from 'lodash';
import { Subscription } from 'rxjs';
import { Post, UserComment } from 'src/app/models/post.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-social',
  templateUrl: './social.page.html',
  styleUrls: ['./social.page.scss'],
})
export class SocialPage implements OnInit {

  posts: Post[] = [];
  loading: boolean = false;

  constructor(
    private firebaseService: FirebaseService,
    private utilsService: UtilsService,
    private router: Router
  ) { }

  user(): User {
    return this.utilsService.loadLocal('user');
  }

  ngOnInit() {
    this.getPost();
  }

  doRefresh(event) {
    setTimeout(() => {
      this.getPost();
      event.target.complete();
    }, 2000);
  }

  getPost() {
    let path = 'users';

    this.loading = true;

    let sub: Subscription = this.firebaseService.getCollectionData(path).subscribe({
      next: (users: any[]) => {
        let allPosts: Post[] = [];

        let userCount = users.length; // Keep track of number of users processed

        users.forEach(user => {
          let userPostsPath = `users/${user.id}/posts`;

          this.firebaseService.getCollectionData(userPostsPath).subscribe({
            next: (userPosts: any[]) => {
              userPosts.forEach(post => {
                post.username = user.name;
                post.userAvatar = user.avatar;
                post.userId = user.id;
                post.showComments = false;

                // Update avatar in existing comments
                if (post.comments && post.comments.length > 0) {
                  post.comments.forEach(comment => {
                    if (comment.userId === user.id) {
                      comment.userAvatar = user.avatar;
                    }
                  });
                }
              });

              allPosts = allPosts.concat(userPosts);

              userCount--;

              if (userCount === 0) {
                this.posts = orderBy(allPosts, [(post: Post) => {
                  let date = new Date(post.timestamp);
                  return date.getTime();
                }], ['desc']);

                this.loading = false;
              }
            },
            error: (error: any) => {
              console.error(error);
              this.loading = false;
            }
          });
        });

        sub.unsubscribe();
      },
      error: (error: any) => {
        console.error(error);
        this.loading = false;
      }
    });

    console.log(this.posts);
    
  }

  likePost(post: Post, userId: string, ownerId: string) {
    if (post.likedBy === null) {      
      post.likedBy = [];
    }
  
    if (!post.likedBy.includes(userId)) {
      post.like++;
      console.log(post.like);
      
      post.likedBy.push(userId);
    } else {
      post.like--;
      post.likedBy = post.likedBy.filter(id => id !== userId);
    }
  
    let path = `users/${ownerId}/posts/${post.id}`;
    this.firebaseService.updateDocument(path, { like: post.like, likedBy: post.likedBy });
  }

  userLikedPost(post: Post, userId: string): boolean {
    // Check if likedBy array exists and user's ID is included
    return post.likedBy !== null && post.likedBy.includes(userId);
  }
  
  addComment(post: Post, commentContent: string , ownerId: string) {
    if (!post.comments) {
      post.comments = []; 
    }
  
    const newComment: UserComment = {
      userId: this.user().id,
      username: this.user().name,
      userAvatar: this.user().avatar,
      content: commentContent
    };

    
  
    post.comments.push(newComment);

    const path = `users/${ownerId}/posts/${post.id}`;
    this.firebaseService.updateDocument(path, { comments: post.comments })
    .then(() => {
      console.log('Comment added successfully.');
    })
    .catch((error) => {
      console.error('Error adding comment:', error);
    });
    
    this.newComment = '';
  }

  newComment: string = ''

  toggleComments(post: Post) {
    post.showComments = !post.showComments;
  }

  getCommentCount(post: Post): number {
    return post.comments ? post.comments.length : 0;
  }
}
