import {
  AppRoot,
  Code,
  Link,
  type CommonQuestion,
  type DefaultPath,
  type NavConfig
} from "react-lib-tools";
import { html as badgeThemeHTML } from "../public/generated/examples/BadgeTheme.json";
import { routes, type Path } from "./routes";
import "./index.css";

/**
 * Documentation site for a fictional component library.
 * Used to develop and test react-lib-tools; see CONTRIBUTING.md.
 */
export default function App() {
  return (
    <AppRoot
      commonQuestions={commonQuestions}
      enableSiteSearch
      nav={nav}
      overview={
        <div>
          <strong>sample-lib</strong> is a fictional component library used to
          develop and test react-lib-tools. Start with the{" "}
          <Link to="/counter">Counter</Link> component.
        </div>
      }
      packageDescription="a sample component library"
      packageName="sample-lib"
      projectsUrl="/projects.json"
      repositoryUrl="https://github.com/bvaughn/react-lib-tools"
      routes={routes}
      versions={versions}
    />
  );
}

const nav: NavConfig<Path | DefaultPath> = [
  { path: "/", title: "Getting started" },
  {
    title: "Counter",
    links: [
      { path: "/counter", title: "Basic usage" },
      {
        title: "API",
        links: [
          { path: "/counter/props", title: "Counter props" },
          {
            path: "/counter/imperative-handle",
            navTitle: "Imperative handle",
            title: "Imperative handle methods and refs"
          }
        ]
      }
    ]
  },
  {
    title: "Badge",
    links: [
      {
        path: "/badge",
        title: "Intents",
        children: [
          {
            path: "/badge/props",
            // Intentionally long (and nested) to exercise wrapping in the sidebar
            title: "Badge props, intents, and theme customization options"
          }
        ]
      }
    ]
  },
  { path: "/common-questions", title: "Common questions" },
  { path: "/support", title: "Support" }
];

const commonQuestions: CommonQuestion[] = [
  {
    id: "controlled-counter",
    question: (
      <>
        Can <code>Counter</code> be controlled?
      </>
    ),
    answer: (
      <p>
        No. <code>Counter</code> manages its own value; use the{" "}
        <code>onChange</code> prop to observe changes or the{" "}
        <Link to="/counter/imperative-handle">imperative handle</Link> to update
        it.
      </p>
    )
  },
  {
    id: "custom-badge-styles",
    question: "Can I customize how badges look?",
    answer: (
      <>
        <p>
          Yes. Pass a <code>className</code> and style it with CSS:
        </p>
        <Code html={badgeThemeHTML} />
      </>
    )
  }
];

const versions = {
  "0.2.0": "",
  "0.1.0": ""
};
