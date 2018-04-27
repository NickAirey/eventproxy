<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:template match="/">
    <rss version="2.0">
      <channel>
        <title>NBC Events</title>
        <description>Narwee Baptist Church Events</description>
        <link>http://narweebaptist.org.au</link>
        <pubDate></pubDate>
        <image>
          <url>http://www.narweebaptist.org.au/wordpress/wp-content/themes/arthemia-premium/images/logo/logo.gif</url>
          <title>NBC logo</title>
        </image>
        <xsl:for-each select="rsp/events/event">
          <xsl:sort select="start_date" />
          <xsl:if test="not(position() > 10)">
            <item>
              <title><xsl:value-of select="name" /></title>
              <description><xsl:value-of select="description"/></description>
              <pubDate><xsl:value-of select="start_date"/></pubDate>
            </item>
          </xsl:if>
        </xsl:for-each>
      </channel>
    </rss>
  </xsl:template>
</xsl:stylesheet>