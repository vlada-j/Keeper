import pwa from "./pwa.js";
import service from "./service.js";

const App = {
	data() {
		return {
			bannerVisible: false,
			isReady: false,
			user: null,
			loginForm: {
				username: null,
				password: null,
			},
			post: null,
			thisYear: (new Date()).getFullYear(),
			posts: []
		}
	},
	mounted() {
		this.isReady = true;
		pwa.on('ready',     () => this.bannerVisible = true);
		pwa.on('dismissed', () => this.bannerVisible = false);
		pwa.on('accepted',  () => this.bannerVisible = false);
		pwa.on('installed',  e => console.log('INSTALLED', e));

		service.on('auth', ({ data }) => {
			this.user = data;
			this.refreshPosts();
		})
	},
	methods: {
		bannerAdd() {
			this.bannerVisible = false
			pwa.install().then(choice => console.log('choice', choice))
		},
		bannerClose() {
			this.bannerVisible = false
		},
		login() {
			service.logIn(this.loginForm.username, this.loginForm.password)
		},
		logout() {
			service.logOut()
		},

		cancel() {
			this.post = null;
		},
		createPost() {
			this.post = {
				content: "",
				checked: false,
				category: 0,
			};
		},
		savePost() {
			const post = {
				content: this.post.content,
				checked: this.post.checked,
				category: this.post.category,
			};
			let promise;

			if (this.post.id) {
				post.id = this.post.id
				promise = service.editNews(post.id, post);
			} else {
				promise = service.addNews(post);
			}

			return promise
				.then(() => this.refreshPosts())
				.then(() => this.cancel())
		},
		selectPost(post) {
			service.getNews(post.id)
				.then(p => {
					this.post = {
						id: post.id,
						content: p.content,
						checked: p.checked,
						category: p.category,
					}
				});
		},
		deletePost(post) {
			service.removeNews(post.id)
				.then(() => this.refreshPosts())
				.then(() => this.cancel());
		},
		checkPost(post) {
			console.log(post.id, post.checked);
		},
		refreshPosts() {
			service.getAllNews()
				.then(posts => this.posts = posts)
				.catch( err => err.code === 'permission-denied' && console.log('Moras biti logovan') );
		},
	}
}

export default Vue.createApp(App).mount( document.querySelector('#app') )
