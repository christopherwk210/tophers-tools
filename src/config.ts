export interface ToolConfig {
  title: string;
  description: string;
  url?: string;
  route?: string;
  about?: string;
}

const githubURL = 'https://github.com/christopherwk210/tophers-tools/tree/master/src/tools/';

export const tools: { [category: string]: ToolConfig[] } = {
  Animation: [
    {
      title: 'Lottie Looper',
      description: 'Tool for determining frame perfect positions for custom lottie loops.',
      route: '/lottie-looper',
      about: githubURL + 'animation/lottie-looper'
    },
    {
      title: 'Smooth Approach',
      description: 'Handy reference utility for a handy easing script.',
      route: '/smooth-approach',
      about: githubURL + 'animation/smooth-approach'
    }
  ],
  GameMaker: [
    {
      title: 'GMS2 Project Analyzer',
      description: 'Generate fun statistics about your GMS2 project - no download or upload required!',
      route: '/project-analyzer',
      about: githubURL + 'gamemaker/project-analyzer'
    },
    {
      title: 'Color Picker',
      description: 'The easy way to get GML color codes.',
      route: '/color-picker',
      about: githubURL + 'gamemaker/color-picker'
    },
    {
      title: 'JavaDoc Gen',
      description: 'Turns GameMaker: Studio script comments into GameMaker Studio 2 compatible JavaDoc comments.',
      route: '/gml-javadoc-gen',
      about: githubURL + 'gamemaker/javadoc-gen'
    }
  ],
  Math: [
    {
      title: 'Ratiomatic',
      description: 'Automatically calculate ratios. Handy for working with resolutions.',
      route: '/ratiomatic',
      about: githubURL + 'math/ratiomatic'
    },
    {
      title: 'Linear Equation Solver',
      description: 'Two points go in, slope and y-intercept come out.',
      route: '/linear-equations',
      about: githubURL + 'math/linear-equation-solver'
    },
    {
      title: 'Cross Multiplier',
      description: 'Solve for unknown in a fraction pair.',
      route: '/cross-multiplier',
      about: githubURL + 'math/cross-multiplier'
    }
  ],
  Forager: [
    {
      title: 'Cosmetic Factory',
      description: 'Ccreate your own cosmetic mods for Forager.',
      url: 'https://topheranselmo.com/fcf'
    },
    {
      title: 'Modding Documentation',
      description: `The home of Forager's Modding API Documnetation.`,
      url: 'https://topheranselmo.com/forager-modding-docs'
    },
    {
      title: 'Secret Settings Generator',
      description: 'Quickly and easily generate a Forager secret settings file.',
      url: 'https://topheranselmo.com/fssg/'
    }
  ]
}