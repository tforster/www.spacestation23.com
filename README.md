# Generic New Project Template

_A Git template for bootstrapping a variety of projects with a consistent set of control files._

## Instructions

1. Create your new repository by clicking the "Use this template" [button](https://github.com/tforster/git-new/generate) from the GitHub repository. (or download from https://github.com/tforster/git-new/archive/master.zip and unzip)
1. Follow the GitHub prompts to complete the configuration of your new repository
1. Clone your new repository to your local develop environment
1. Install NPM dependencies including linters and code prettiers `npm i`
1. Edit [README.md](README.md)
   - Edit the title to match your project
   - Edit the description to describe your project
   - Edit Prerequisites, Setup and Configuration, Usage, For Users and Meta sections
1. Edit [package.json](package.json)
   - Update the title to match the title of this README
   - Update the description to match the description of this README
   - Edit the semantic version to match your project requirements
1. Update your LICENSE
   - Edit the year and fullname variables in [LICENSE.txt](LICENSE.txt)
   - The provided LICENSE file implements the MIT license as per [https://choosealicense.com/licenses/mit](https://choosealicense.com/licenses/mit)
   - For closed source delete the LICENSE.txt file and update the package.json license property to "UNLICENSED"
   - If neither MIT or UNLICENSED suit your needs consider creating a LICENSE.txt from [https://choosealicense.com/](https://choosealicense.com/)
1. Update [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). For more information on code of conduct see [https://opensource.guide/code-of-conduct/](https://opensource.guide/code-of-conduct/)
1. Update [CONTRIBUTING.md](CONTRIBUTING.md). For more information about open source contributions see [https://help.github.com/en/github/building-a-strong-community/setting-guidelines-for-repository-contributors](https://help.github.com/en/github/building-a-strong-community/setting-guidelines-for-repository-contributors)
1. Delete any unwanted files in /docker (or the entire /docker folder if you're not containerising)
1. Update [CHANGELOG.md](CHANGELOG.md)
1. Delete this instruction block

# Table of Content

- [Generic New Project Template](#generic-new-project-template)
  - [Instructions](#instructions)
- [Table of Content](#table-of-content)
- [Prerequisites](#prerequisites)
- [Setup and Configuration](#setup-and-configuration)
- [Usage](#usage)
- [For Users](#for-users)
- [Change Log](#change-log)
- [Meta](#meta)
- [Contributing](#contributing)

# Prerequisites

The versions listed for these prerequisites are current at the time of writing. More recent versions will likely work but "your mileage may vary".

- A good code editor.
- [Node.js v12.13.0 and NPM 6.14.5](https://nodejs.org/en/download/)
- [Git 2.25](https://git-scm.com/downloads)

# Setup and Configuration

Clone this repository as your new project.

```sh
git clone git@github.com:tforster/git-new.git /my/path/to/my/project-name
```

# Usage

- Describe how your repository should be used.
- Include any references to other repositories such as NPM, DockerHub, etc.

# For Users

- Use this optional section to describe to end users how to install or run release artifacts.

# Change Log

See [CHANGELOG.md](CHANGELOG.md)

# Meta

Troy Forster – [@tforster](https://twitter.com/tforster) – troy.forster@gmail.com

See [LICENSE](LICENSE.md) for more information.

[https://github.com/tforster/git-new](https://github.com/tforster/git-new)

# Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
