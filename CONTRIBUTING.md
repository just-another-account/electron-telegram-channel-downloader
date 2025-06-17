# 🤝 Contributing to Telegram Channel Downloader

Thank you for your interest in contributing! This project welcomes contributions from developers of all skill levels.

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [How to Contribute](#how-to-contribute)
5. [Coding Standards](#coding-standards)
6. [Pull Request Process](#pull-request-process)
7. [Issue Guidelines](#issue-guidelines)
8. [Community](#community)

## 📜 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of:
- Age, body size, disability, ethnicity, gender identity and expression
- Level of experience, education, socio-economic status
- Nationality, personal appearance, race, religion
- Sexual identity and orientation

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team at [conduct@telegram-downloader.example.com](mailto:conduct@telegram-downloader.example.com). All complaints will be reviewed and investigated promptly and fairly.

## 🚀 Getting Started

### Ways to Contribute

- **🐛 Bug Reports**: Help us identify and fix issues
- **💡 Feature Requests**: Suggest new functionality
- **📝 Documentation**: Improve guides, README, and code comments
- **🌍 Translations**: Add support for new languages
- **🔧 Code**: Fix bugs, implement features, improve performance
- **🎨 Design**: UI/UX improvements and design assets
- **🧪 Testing**: Write tests, perform QA testing

### Good First Issues

Look for issues labeled with:
- `good first issue`: Perfect for newcomers
- `help wanted`: We'd love community help on these
- `documentation`: Documentation improvements
- `translation`: Language-related work

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18+ 
- **pnpm** (recommended) or npm/yarn
- **Git**
- **Code Editor** (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/telegram-channel-downloader.git
   cd telegram-channel-downloader
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-repo/telegram-channel-downloader.git
   ```

### Install Dependencies

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Verify Setup

```bash
# Run tests
pnpm test

# Check linting
pnpm lint

# Build for production
pnpm build
```

## 🤝 How to Contribute

### 1. Choose What to Work On

- Browse [open issues](https://github.com/yourusername/telegram-channel-downloader/issues)
- Check the [project roadmap](https://github.com/yourusername/telegram-channel-downloader/projects)
- Look at [good first issues](https://github.com/yourusername/telegram-channel-downloader/labels/good%20first%20issue)

### 2. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Make Changes

- Write clean, well-documented code
- Follow the [coding standards](#coding-standards)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
# Run all tests
pnpm test

# Test specific components
pnpm test:unit
pnpm test:e2e

# Check code style
pnpm lint
pnpm format
```

### 5. Commit Changes

Use conventional commit format:

```bash
git add .
git commit -m "feat(download): add resume download functionality"

# Commit types:
# feat: new feature
# fix: bug fix
# docs: documentation
# style: formatting
# refactor: code restructuring
# test: adding tests
# chore: maintenance
```

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## 📏 Coding Standards

### JavaScript/TypeScript Style

```javascript
// Use camelCase for variables and functions
const downloadManager = new DownloadManager()
const isConnected = true

// Use PascalCase for classes and components
class TelegramService {
  constructor() {
    // ...
  }
}

// Use async/await instead of promises
async function downloadFile(url) {
  try {
    const response = await fetch(url)
    return await response.blob()
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

// Use template literals for strings
const message = `Downloaded ${fileCount} files successfully`

// Use destructuring when appropriate
const { name, size, type } = fileInfo
const [first, ...rest] = items

// Use arrow functions for short functions
const filterImages = files => files.filter(f => f.type.startsWith('image/'))
```

### Vue Component Style

```vue
<template>
  <!-- Use kebab-case for custom components -->
  <download-manager :config="downloadConfig" @progress="handleProgress" />
  
  <!-- Use v-bind shorthand -->
  <v-btn :disabled="!isReady" @click="startDownload">
    Start Download
  </v-btn>
  
  <!-- Use v-if/v-else instead of v-show for performance -->
  <div v-if="loading">Loading...</div>
  <div v-else>Content</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

// Group imports
const { t } = useI18n()

// Reactive data
const loading = ref(false)
const files = ref([])

// Computed properties
const fileCount = computed(() => files.value.length)

// Methods
const startDownload = async () => {
  loading.value = true
  try {
    // Download logic
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Initialize component
})
</script>

<style scoped>
/* Use CSS custom properties */
.download-button {
  --primary-color: #1976d2;
  background-color: var(--primary-color);
}

/* Use BEM methodology for custom styles */
.download-manager {
  &__header {
    display: flex;
    align-items: center;
  }
  
  &__content {
    padding: 16px;
  }
}
</style>
```

### File Organization

```
src/
├── components/          # Reusable Vue components
│   ├── common/         # Generic components
│   ├── download/       # Download-specific components
│   └── auth/           # Authentication components
├── services/           # Business logic services
├── stores/             # Pinia state management
├── utils/              # Pure utility functions
├── types/              # TypeScript type definitions
└── constants/          # Application constants
```

### Documentation Standards

```javascript
/**
 * Downloads media files from a Telegram channel
 * @param {Object} config - Download configuration
 * @param {string} config.channelId - Telegram channel ID
 * @param {string[]} config.mediaTypes - Types of media to download
 * @param {string} config.outputPath - Output directory path
 * @param {Function} config.onProgress - Progress callback function
 * @returns {Promise<DownloadResult>} Download result summary
 * @throws {DownloadError} When download fails
 * 
 * @example
 * const result = await downloadChannelMedia({
 *   channelId: '123456789',
 *   mediaTypes: ['images', 'videos'],
 *   outputPath: '/downloads',
 *   onProgress: (progress) => console.log(progress)
 * })
 */
async function downloadChannelMedia(config) {
  // Implementation
}
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] **Tests pass**: `pnpm test`
- [ ] **Linting passes**: `pnpm lint`
- [ ] **Build succeeds**: `pnpm build`
- [ ] **Documentation updated**: README, docs, code comments
- [ ] **Changelog updated**: If user-facing changes

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## How Has This Been Tested?
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing on [OS/Browser]

## Screenshots (if applicable)
[Add screenshots of UI changes]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and builds
2. **Code Review**: Maintainers review code quality and design
3. **Testing**: Manual testing for UI changes
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge to main branch

### After Merge

- Delete your feature branch
- Update your local main branch
- Consider working on another issue!

## 🐛 Issue Guidelines

### Bug Reports

Use the bug report template and include:

- **Environment**: OS, app version, browser (if applicable)
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable
- **Error messages**: Full error text
- **Additional context**: Any other relevant information

### Feature Requests

Use the feature request template and include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should this work?
- **Alternatives considered**: Other ways to solve this
- **Additional context**: Examples, mockups, etc.

### Questions and Discussions

For questions and general discussions:
- Check existing [discussions](https://github.com/yourusername/telegram-channel-downloader/discussions)
- Search for similar questions in issues
- Use appropriate discussion categories

## 🌍 Translation Contributions

### Adding a New Language

1. **Check if the language is requested**: Look for related issues
2. **Copy base translation file**:
   ```bash
   cp src/i18n/locales/en.json src/i18n/locales/[language-code].json
   ```

3. **Translate all keys**: Maintain the same structure
4. **Update language detector**: Add language to `src/i18n/index.js`
5. **Add to language selector**: Update component options
6. **Test thoroughly**: Ensure all UI elements display correctly

### Translation Guidelines

- **Maintain context**: Consider UI space constraints
- **Use native terms**: Prefer native language terms over transliterations
- **Be consistent**: Use the same terms throughout the application
- **Test in UI**: Ensure translations fit in the interface
- **Cultural adaptation**: Adapt for local conventions (dates, numbers, etc.)

## 🎨 Design Contributions

### UI/UX Guidelines

- **Follow Material Design 3**: Use Vuetify components when possible
- **Accessibility first**: Ensure WCAG 2.1 AA compliance
- **Responsive design**: Test on various screen sizes
- **Performance**: Optimize images and animations
- **Consistency**: Follow existing design patterns

### Assets and Icons

- **Icons**: Use Material Design Icons (MDI)
- **Images**: Provide high-DPI versions
- **Colors**: Follow the established color palette
- **Typography**: Use Roboto font family

## 🧪 Testing Contributions

### Writing Tests

```javascript
// Unit test example
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DownloadButton from '@/components/DownloadButton.vue'

describe('DownloadButton', () => {
  it('emits download event when clicked', async () => {
    const wrapper = mount(DownloadButton, {
      props: { disabled: false }
    })
    
    await wrapper.find('button').trigger('click')
    
    expect(wrapper.emitted('download')).toBeTruthy()
  })
  
  it('is disabled when loading', () => {
    const wrapper = mount(DownloadButton, {
      props: { loading: true }
    })
    
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })
})
```

### Test Types

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test app performance under load

## 💬 Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Discord**: Real-time chat and community support
- **Email**: Security issues and private matters

### Getting Help

- **Stuck on something?** Ask in GitHub Discussions
- **Need real-time help?** Join our Discord server
- **Found a security issue?** Email security@telegram-downloader.example.com

### Recognition

Contributors are recognized in:
- **README**: Major contributors listed
- **Release Notes**: Contributions acknowledged
- **GitHub**: Contributor statistics
- **Discord**: Special contributor role

## 📝 License

By contributing to Telegram Channel Downloader, you agree that your contributions will be licensed under the MIT License.

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make this project better. Whether you're fixing a typo, translating the interface, or implementing a major feature, your work is appreciated by the entire community.

**Happy coding!** 🎉 