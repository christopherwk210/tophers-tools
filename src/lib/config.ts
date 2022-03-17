export interface ToolConfig {
  title: string;
  description: string;
  route: string;
  about: string;
}

const githubURL = 'https://github.com/christopherwk210/tophers-tools/tree/master/src/tools/';

export const tools: { [category: string]: ToolConfig[] } = {
  GameMaker: [
    {
      title: 'GM Color Picker',
      description: 'The easy way to get GML color codes.',
      route: '/color-picker',
      about: githubURL + 'gamemaker/color-picker'
    },
    {
      title: 'GML JavaDoc Gen',
      description: 'Quickly turn GameMaker: Studio script comments into GameMaker Studio 2 compatible JavaDoc comments.',
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
    }
  ]
}