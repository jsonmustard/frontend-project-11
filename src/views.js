import onChange from 'on-change';
import i18next from 'i18next';

const watch = (elements, state) => {
  const renderFeeds = () => {
    elements.feedsContainer.innerHTML = '';

    const divCard = document.createElement('div');
    divCard.className = 'card border-0';
    elements.feedsContainer.appendChild(divCard);

    const divCardBody = document.createElement('div');
    divCardBody.className = 'card-body';
    divCard.appendChild(divCardBody);

    const h2 = document.createElement('h2');
    h2.className = 'card-title h4';
    h2.textContent = 'Фиды';
    divCardBody.appendChild(h2);

    const ul = document.createElement('ul');
    ul.className = 'list-group border-0 rounded-0';
    divCard.appendChild(ul);
    state.feeds.forEach((feed) => {
      const li = document.createElement('li');
      li.className = 'list-group-item border-0 border-end-0';

      const h3 = document.createElement('h3');
      h3.className = 'h6 m-0';
      h3.textContent = feed.title;
      li.appendChild(h3);

      const p = document.createElement('p');
      p.className = 'm-0 small text-black-50';
      p.textContent = feed.description;
      li.appendChild(p);

      ul.appendChild(li);
    });
  };

  const renderPosts = () => {
    elements.postsContainer.innerHTML = '';

    const divCard = document.createElement('div');
    divCard.className = 'card border-0';
    elements.postsContainer.appendChild(divCard);

    const divCardBody = document.createElement('div');
    divCardBody.className = 'card-body';
    divCard.appendChild(divCardBody);

    const h2 = document.createElement('h2');
    h2.className = 'card-title h4';
    h2.textContent = 'Посты';
    divCardBody.appendChild(h2);

    const ul = document.createElement('ul');
    ul.className = 'list-group border-0 rounded-0';
    divCard.appendChild(ul);

    state.posts.forEach((post) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-start border-0 border-end-0';

      const a = document.createElement('a');
      a.href = post.link;
      a.className = !post.isRead ? 'fw-bold' : 'fw-normal';
      a.dataset.id = post.id;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = post.title;

      li.appendChild(a);

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn btn-outline-primary btn-sm';
      button.dataset.id = post.id;
      button.dataset.bsToggle = 'modal';
      button.dataset.bsTarget = '#modal';
      button.textContent = 'Просмотр';

      li.appendChild(button);

      ul.appendChild(li);
    });
  };

  const renderForm = () => {
    elements.inputUrlElement.value = state.form.url;
    elements.inputUrlElement.focus();

    switch (state.form.isDisabled) {
      case false:
        elements.inputUrlElement.removeAttribute('disabled');
        elements.submitButtonElement.removeAttribute('disabled');
        break;
      case true:
        elements.inputUrlElement.setAttribute('disabled', '');
        elements.submitButtonElement.setAttribute('disabled', '');
        break;
      default:
        throw new Error('unknown isActive state of submission form');
    }
  };

  const renderModal = (postId) => {
    const { title, description, link } = state.posts.find((i) => i.id === postId);
    elements.titleElement.textContent = title;
    elements.bodyElement.textContent = description;
    elements.linkElement.href = link;
  };

  const setFeedbackStyles = (isValid) => {
    elements.inputUrlElement.classList.toggle('is-invalid', !isValid);
    elements.feedbackMessageElement.classList.toggle('text-danger', !isValid);
    elements.feedbackMessageElement.classList.toggle('text-success', isValid);
  };

  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.url':
        renderForm();
        break;
      case 'form.feedback':
        elements.feedbackMessageElement.textContent = i18next.t(`${path}.${value}`);
        setFeedbackStyles(value === 'success');
        break;
      case 'feeds':
        renderFeeds();
        break;
      case 'posts':
        renderPosts();
        break;
      case 'modal.postId':
        if (value !== null) {
          renderModal(value);
        }
        break;
      default:
        if (path.startsWith('posts.')) {
          renderPosts();
        }
    }
  });

  return watchedState;
};

export default watch;
