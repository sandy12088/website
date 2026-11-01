---
sections:
  - block: hero
    id: news
    content:
      title: 理论物理研究组
      subtitle: ''
      text: |-
        欢迎来到北京师范大学马宇翰研究组。我们通过理论研究与学术合作，探索物理学的基本问题。

        我们的研究方向包括热力学、非平衡动力学与物理教育。
      announcement:
        text: 🎉 Phys.org 报道了我们的最新研究。
        link:
          text: 阅读报道
          url: https://phys.org/news/2025-01-rethinking-carnot-scientists-traditional-power.html
      primary_action:
        text: 研究成果
        url: /publications/
        icon: sparkles
    design:
      no_padding: true
  - block: collection
    id: papers
    content:
      title: 精选论文
      count: 0
      filters:
        folders:
          - publication
        featured_only: true
    design:
      view: citation
      columns: 1
  - block: resume-biography-3
    content:
      username: yhma
      text: 研究组负责人
    design:
      background:
        image:
          filters:
            brightness: 1
          size: large
          position: center
          parallax: false
  - block: community/people
    content:
      title: 研究组成员
      subtitle: 完整名单请见**[成员页面](/people/)**。
      user_groups:
        - Principal Investigator
        - Faculty Members
        - Postdoctoral Scholars
        - Graduate Students
        - Students
      sort_by: Params.last_name
      sort_ascending: true
    design:
      show_role: true
      show_social: true
      show_interests: false
---
