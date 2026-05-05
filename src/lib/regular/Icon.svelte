<script lang="ts">

    type Props = { svg: string, fill?: string, size?: string, width?: string, height?: string }
    let { svg, fill = "white", size = "1rem", width = size, height = size }: Props = $props();

</script>

<svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 -960 960 960">
    <path fill={fill} d={svg}/>
</svg>