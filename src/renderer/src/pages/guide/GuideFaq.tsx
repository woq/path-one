import React from 'react'
import { DEFAULT_MIXED_PORT } from '../../../../shared/path-line'
import { GuidePage, GuideSection } from './shared'

export const GuideFaq: React.FC = () => (
  <GuidePage title="常见问题" lead="短答优先；仍不通时按文末清单带截图求助。">
    <GuideSection title="问答">
      <div className="space-y-4">
        <div>
          <p className="text-fx-text font-medium text-sm">账号填哪里？</p>
          <p>「账号」页只填端口、账号、密码。</p>
        </div>
        <div>
          <p className="text-fx-text font-medium text-sm">浏览器模式下 Git 不通？</p>
          <p>到「系统服务」启动服务后，再打开「全局模式」。</p>
        </div>
        <div>
          <p className="text-fx-text font-medium text-sm">直连规则能改吗？</p>
          <p>不能。仅「路由分流」里的自定义规则可编辑。</p>
        </div>
        <div>
          <p className="text-fx-text font-medium text-sm">本地端口是多少？</p>
          <p>固定为 {DEFAULT_MIXED_PORT}。</p>
        </div>
        <div>
          <p className="text-fx-text font-medium text-sm">测试国外失败？</p>
          <p>确认已保存账号，并已打开浏览器模式或全局模式，内核为运行中。</p>
        </div>
        <div>
          <p className="text-fx-text font-medium text-sm">密码含特殊符号？</p>
          <p>整段复制粘贴即可。</p>
        </div>
      </div>
    </GuideSection>

    <GuideSection title="求助时请带上">
      <ol className="list-decimal pl-5 space-y-1">
        <li>开通通知截图（可打码密码中间几位）</li>
        <li>「账号」页截图（含连通测试结果）</li>
        <li>检测页截图</li>
        <li>当前是浏览器模式还是全局模式</li>
        <li>若相关：系统服务页、内核日志、路由分流截图</li>
      </ol>
    </GuideSection>
  </GuidePage>
)
